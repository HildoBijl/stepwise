import { type ReactElement, type ReactNode, cloneElement } from 'react'

import { type ComponentNode, type Message, type MessageNode, type PluralNode, type SelectNode, assertValidMessage } from '../../message/index.ts'

import { type ReactComponentBinding, type ReactMessageSource, createReactMessageSource } from './reactToMessage.ts'

type RenderingContext = {
	locale: string
	source: ReactMessageSource
}

/*
 * General message-to-react conversion.
 */

// Apply a translated message to its original React content.
export function messageToReact(message: Message, sourceNode: unknown, locale: string): ReactNode {
	assertValidMessage(message)
	const source = createReactMessageSource(sourceNode)
	assertCompatibleComponents(message, source)
	return renderMessage(message, { locale, source }, '$')
}

function renderMessage(message: Message, context: RenderingContext, path: string): ReactNode[] {
	return message.map((node, index) => renderNode(node, context, `${path}[${index}]`))
}

function renderNode(node: MessageNode, context: RenderingContext, path: string): ReactNode {
	switch (node.type) {
		case 'text': return node.value
		case 'variable': return getVariable(node.name, context) as ReactNode
		case 'component': return renderComponent(node, context, path)
		case 'plural': return renderPlural(node, context, path)
		case 'select': return renderSelect(node, context, path)
	}
}

/*
 * Type-specific message-to-react conversion.
 */

// Apply a translation to a Component node.
function renderComponent(node: ComponentNode, context: RenderingContext, path: string): ReactElement {
	// Based on the ID of the node, find the corresponding node from the source. Check if it exists and the types match.
	const sourceId = node.copyOf ?? node.id
	const binding = context.source.components.get(sourceId)
	if (!binding) throw new Error(`${path}: Component references unknown source occurrence "${sourceId}".`)
	if (node.copyOf && context.source.components.has(node.id)) throw new Error(`${path}: Copied component ID "${node.id}" collides with a source occurrence.`)
	if (node.component !== binding.source.component) throw new Error(`${path}: Expected component "${binding.source.component}", received "${node.component}".`)

	// Apply the translation to all slots of the component.
	const translatedProps = Object.fromEntries(Object.entries(node.slots).map(([name, slot]) => [name, renderMessage(slot, context, `${path}.slots.${name}`)]))
	return cloneElement(binding.element, { ...translatedProps, key: node.id })
}

// Apply a translation to a Plural node.
function renderPlural(node: PluralNode, context: RenderingContext, path: string): ReactNode {
	// Obtain and check the variable.
	const value = getVariable(node.variable, context)
	if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${path}: Plural variable "${node.variable}" must be a finite number.`)

	// If there is an exact branch that matches, render it.
	const exactBranch = node.exactBranches?.[String(value)]
	if (exactBranch) return renderMessage(exactBranch, context, `${path}.exactBranches.${value}`)

	// Find the right branch category and render that.
	const category = new Intl.PluralRules(context.locale, { type: node.form ?? 'cardinal' }).select(value)
	const branch = node.branches[category] ?? node.branches.other
	return renderMessage(branch, context, `${path}.branches.${category}`)
}

// Apply a translation to a Select node: find the value and render the corresponding branch.
function renderSelect(node: SelectNode, context: RenderingContext, path: string): ReactNode {
	const value = String(getVariable(node.variable, context))
	return renderMessage(node.branches[value] ?? node.branches.other, context, `${path}.branches.${value}`)
}

/*
 * Shape checking.
 */

// Recursively validate slots within the component.
function assertCompatibleComponents(message: Message, source: ReactMessageSource): void {
	const uses = new Map<string, number>()
	visitComponents(message, '$', node => {
		const sourceId = node.copyOf ?? node.id
		const binding = source.components.get(sourceId)
		if (!binding) throw new Error(`Component references unknown source occurrence "${sourceId}".`)
		if (node.copyOf && source.components.has(node.id)) throw new Error(`Copied component ID "${node.id}" collides with a source occurrence.`)
		if (node.component !== binding.source.component)
			throw new Error(`Expected component "${binding.source.component}", received "${node.component}".`)
		assertMatchingSlots(node, binding, `Component "${node.id}"`)

		const count = (uses.get(sourceId) ?? 0) + 1
		uses.set(sourceId, count)
		if (count > 1 && !binding.definition.canCopy) throw new Error(`Component "${sourceId}" may not be copied.`)
	})
	source.components.forEach(binding => {
		if ((uses.get(binding.source.id) ?? 0) === 0 && !binding.definition.canDelete)
			throw new Error(`Component "${binding.source.id}" may not be deleted.`)
	})
}

// Assume the slots of the node (the target) and its binding (the source) line up.
function assertMatchingSlots(node: ComponentNode, binding: ReactComponentBinding, path: string): void {
	const sourceSlots = Object.keys(binding.source.slots).sort()
	const targetSlots = Object.keys(node.slots).sort()
	if (sourceSlots.length !== targetSlots.length || sourceSlots.some((slot, index) => slot !== targetSlots[index])) throw new Error(`${path}: Component "${binding.source.id}" must retain its translated props: ${sourceSlots.join(', ') || '(none)'}.`)
}

/*
 * Support functions.
 */

// Traverse through all the nodes inside a message.
function visitComponents(message: Message, path: string, visit: (node: ComponentNode, path: string) => void): void {
	message.forEach((node, index) => {
		const nodePath = `${path}[${index}]`
		if (node.type === 'component') {
			visit(node, nodePath)
			Object.entries(node.slots).forEach(([name, slot]) => visitComponents(slot, `${nodePath}.slots.${name}`, visit))
		} else if (node.type === 'plural') {
			Object.entries(node.branches).forEach(([name, branch]) => visitComponents(branch, `${nodePath}.branches.${name}`, visit))
			Object.entries(node.exactBranches ?? {}).forEach(([value, branch]) => visitComponents(branch, `${nodePath}.exactBranches.${value}`, visit))
		} else if (node.type === 'select') {
			Object.entries(node.branches).forEach(([name, branch]) => visitComponents(branch, `${nodePath}.branches.${name}`, visit))
		}
	})
}

// Get a specific variable from the rendering context.
function getVariable(name: string, context: RenderingContext): unknown {
	if (!context.source.variables.has(name)) throw new Error(`Translation references unknown variable "${name}".`)
	return context.source.variables.get(name)
}
