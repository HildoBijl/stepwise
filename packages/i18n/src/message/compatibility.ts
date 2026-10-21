import { shallowEqualArrays } from '@step-wise/js-utils'

import { type ComponentNode, type Message, type MessageNode, type PluralNode, type SelectNode } from './types.ts'
import { type MessageValidationIssue } from './validation.ts'

// Set up a custom error type for incompatible messages.
export class IncompatibleMessageError extends Error {
	readonly issues: readonly MessageValidationIssue[]

	constructor(issues: readonly MessageValidationIssue[]) {
		super(`Incompatible translation message:\n${issues.map(issue => `${issue.path}: ${issue.message}`).join('\n')}`)
		this.name = 'IncompatibleMessageError'
		this.issues = issues
	}
}

/*
 * Public functions for compatibility validation.
 */

// Assume that a target message is semantically compatible with its source and throw otherwise.
export function assertCompatibleMessage(source: Message, target: Message): void {
	const issues = validateMessageCompatibility(source, target)
	if (issues.length > 0) throw new IncompatibleMessageError(issues)
}

// Validate source-dependent target semantics while allowing text and node ordering to differ.
export function validateMessageCompatibility(source: Message, target: Message): MessageValidationIssue[] {
	// Get the shape of the source and the target.
	const sourceShape = collectMessageShape(source)
	const targetShape = collectMessageShape(target)

	// Check all parts of the shape and see if they match. Add any potential issues to the issues list.
	const issues: MessageValidationIssue[] = []
	validateVariables(sourceShape, targetShape, issues)
	validateComponents(sourceShape.components, targetShape.components, issues)
	validateConstructs(sourceShape.plurals, targetShape.plurals, pluralKey, 'plural', issues)
	validateConstructs(sourceShape.selects, targetShape.selects, selectKey, 'select', issues)
	return issues
}

/*
 * Shape determination.
 */

type MessageShape = {
	variables: Map<string, string>
	components: Map<string, LocatedNode<ComponentNode>>
	plurals: LocatedNode<PluralNode>[]
	selects: LocatedNode<SelectNode>[]
}

type LocatedNode<Node extends MessageNode> = {
	node: Node
	path: string
}

// Turn a given message into a MessageShape object.
function collectMessageShape(message: Message): MessageShape {
	const shape: MessageShape = { variables: new Map(), components: new Map(), plurals: [], selects: [] }
	collectNodes(message, '$', shape)
	return shape
}

// Depending on the type of message, update its shape.
function collectNodes(message: Message, path: string, shape: MessageShape): void {
	message.forEach((node, index) => {
		const nodePath = `${path}[${index}]`
		switch (node.type) {
			case 'text': return

			case 'variable':
				shape.variables.set(node.name, nodePath)
				return

			case 'component':
				shape.components.set(node.id, { node, path: nodePath })
				Object.entries(node.slots).forEach(([name, slot]) => collectNodes(slot, `${nodePath}.slots.${name}`, shape))
				return

			case 'plural':
				shape.variables.set(node.variable, `${nodePath}.variable`)
				shape.plurals.push({ node, path: nodePath })
				Object.entries(node.branches).forEach(([name, branch]) => collectNodes(branch, `${nodePath}.branches.${name}`, shape))
				Object.entries(node.exactBranches ?? {}).forEach(([value, branch]) => collectNodes(branch, `${nodePath}.exactBranches.${value}`, shape))
				return

			case 'select':
				shape.variables.set(node.variable, `${nodePath}.variable`)
				shape.selects.push({ node, path: nodePath })
				Object.entries(node.branches).forEach(([name, branch]) => collectNodes(branch, `${nodePath}.branches.${name}`, shape))
				return
		}
	})
}

/*
 * Part validation.
 */

// Check if the variables of the two messages line up.
function validateVariables(source: MessageShape, target: MessageShape, issues: MessageValidationIssue[]): void {
	target.variables.forEach((path, name) => {
		if (!source.variables.has(name)) issues.push({ path, message: `Translation references unknown variable "${name}".` })
	})
	source.variables.forEach((_, name) => {
		if (!target.variables.has(name)) issues.push({ path: '$', message: `Translation omits source variable "${name}".` })
	})
}

// Check if the components of the two messages line up by shape.
function validateComponents(source: Map<string, LocatedNode<ComponentNode>>, target: Map<string, LocatedNode<ComponentNode>>, issues: MessageValidationIssue[]): void {
	target.forEach(({ node, path }) => {
		// Check if the source has this target component.
		const sourceId = node.copyOf ?? node.id
		const sourceComponent = source.get(sourceId)?.node
		if (!sourceComponent) {
			issues.push({ path, message: `Component references unknown source occurrence "${sourceId}".` })
			return
		}
		if (node.copyOf && source.has(node.id)) issues.push({ path: `${path}.id`, message: `Copied component ID "${node.id}" collides with a source occurrence.` })
		if (node.component !== sourceComponent.component) issues.push({ path: `${path}.component`, message: `Expected component "${sourceComponent.component}", received "${node.component}".` })

		// Check that the slots for the two messages also match up.
		const sourceSlots = Object.keys(sourceComponent.slots).sort()
		const targetSlots = Object.keys(node.slots).sort()
		if (!shallowEqualArrays(sourceSlots, targetSlots)) issues.push({ path: `${path}.slots`, message: `Component "${sourceId}" must retain its translated slots: ${sourceSlots.join(', ') || '(none)'}.` })
	})
}

// Check if a constructs (Plural, Select) of a message line up with those of the source message.
function validateConstructs<Node extends PluralNode | SelectNode>(source: LocatedNode<Node>[], target: LocatedNode<Node>[], getKey: (node: Node) => string, type: string, issues: MessageValidationIssue[]): void {
	// Match the target constructs with those in the source.
	const remainingSource = [...source]
	target.forEach(({ node, path }) => {
		const key = getKey(node)
		const index = remainingSource.findIndex(entry => getKey(entry.node) === key)
		if (index === -1) {
			issues.push({ path, message: `Translation contains an unknown or changed ${type} construct for variable "${node.variable}".` })
			return
		}
		remainingSource.splice(index, 1)
	})

	// If any source construct remains unmatched, note the problem.
	remainingSource.forEach(({ node }) => issues.push({ path: '$', message: `Translation omits a source ${type} construct for variable "${node.variable}".` }))
}

/*
 * Key construction.
 */

// Get the key for a Plural node.
function pluralKey(node: PluralNode): string {
	return JSON.stringify([node.variable, node.form ?? 'cardinal', Object.keys(node.exactBranches ?? {}).sort()])
}

// Get the key for a Select node.
function selectKey(node: SelectNode): string {
	return JSON.stringify([node.variable, Object.keys(node.branches).sort()])
}
