import { Children, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react'

import { type ComponentNode, type Message, type MessageNode, type PluralBranches, type PluralCategory, type SelectBranches, normalizeMessage } from '../message/index.ts'

import { getTranslationComponentDefinition, type TranslationComponentDefinition } from './withTranslation.tsx'
import { type ExactPluralBranchProps, type PluralBranchProps, type PluralProps, getPluralBranch, isPluralConstruct } from './Plural.tsx'
import { type SelectBranchProps, type SelectOtherProps, type SelectProps, isSelectBranch, isSelectConstruct, Select } from './Select.tsx'
import { isTranslationVariable } from './variable.ts'

/*
 * Types.
 */

type ConversionContext = {
	nextComponentId: number
	components: Map<string, ReactComponentBinding>
	variables: Map<string, unknown>
}

export type ReactMessageSource = {
	message: Message
	components: ReadonlyMap<string, ReactComponentBinding>
	variables: ReadonlyMap<string, unknown>
}

export type ReactComponentBinding = {
	element: ReactElement
	definition: TranslationComponentDefinition
	source: ComponentNode
}

/*
 * General react-to-message conversion.
 */

// Convert translatable React content to its format-independent message representation.
export function reactToMessage(node: unknown): Message {
	return createReactMessageSource(node).message
}

// Turn the React node into a message while keeping track of its components and the variables therein.
export function createReactMessageSource(node: unknown): ReactMessageSource {
	const context: ConversionContext = { nextComponentId: 1, components: new Map(), variables: new Map() }
	const message = normalizeMessage(convertNode(node, context))
	return { message, components: context.components, variables: context.variables }
}

// Convert a React node into message nodes. How to do so depends on its type.
function convertNode(node: unknown, context: ConversionContext): MessageNode[] {
	if (node === null || node === undefined || typeof node === 'boolean') return []
	if (typeof node === 'string' || typeof node === 'number') return [{ type: 'text', value: String(node) }]
	if (isTranslationVariable(node)) {
		addVariable(node.name, node.value, context)
		return [{ type: 'variable', name: node.name }]
	}
	if (Array.isArray(node)) return node.flatMap(child => convertNode(child, context))
	if (isIterable(node)) return [...node].flatMap(child => convertNode(child, context))
	if (!isValidElement(node)) throw new Error('Unsupported value in translatable React content. Wrap runtime values with variable(name, value).')
	if (node.type === Fragment) return convertNode((node.props as { children?: unknown }).children, context)
	if (isPluralConstruct(node.type)) return [convertPlural(node, context)]
	if (isSelectConstruct(node.type)) return [convertSelect(node, context)]
	return [convertElement(node, context)]
}

/*
 * Specific (type-defendent) react-to-message conversion.
 */

// Convert a regular React element to a component node and remember its original element.
function convertElement(element: ReactElement, context: ConversionContext): MessageNode {
	const definition = getTranslationComponentDefinition(element.type)
	const id = `c${context.nextComponentId++}`

	// Turn the element's props into slots.
	const slots: Record<string, Message> = {}
	const props = element.props as Record<string, unknown>
	definition.translatedProps.forEach(prop => {
		if (props[prop] !== undefined) slots[prop] = normalizeMessage(convertNode(props[prop], context))
	})

	// Assemble the data into a component message.
	const source = { type: 'component' as const, id, component: definition.tag, slots }
	context.components.set(id, { definition, element, source })
	return source
}

// Convert a Plural construct and register its runtime value.
function convertPlural(element: ReactElement, context: ConversionContext): MessageNode {
	const props = element.props as PluralProps

	// Check/process the variable.
	if (!isTranslationVariable(props.value)) throw new Error('Plural value must be created with variable(name, value).')
	addVariable(props.value.name, props.value.value, context)

	// Check all the branches, sorting them by regular and exact branches.
	const branches: Partial<Record<PluralCategory, Message>> = {}
	const exactBranches: Record<string, Message> = {}
	getPluralBranches(props.children).forEach(({ branch, category }) => {
		const branchProps = branch.props as PluralBranchProps
		if (category === 'exact') {
			const { value } = branch.props as ExactPluralBranchProps
			if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Plural.Exact requires a finite numeric value.')
			const valueKey = String(value)
			if (exactBranches[valueKey]) throw new Error(`Plural contains duplicate exact branch "${valueKey}".`)
			exactBranches[valueKey] = normalizeMessage(convertNode(branchProps.children, context))
		} else {
			if (branches[category]) throw new Error(`Plural contains duplicate ${category} branch.`)
			branches[category] = normalizeMessage(convertNode(branchProps.children, context))
		}
	})
	if (!branches.other) throw new Error('Plural requires a Plural.Other branch.')

	// Return the outcome as Message object.
	return {
		type: 'plural',
		variable: props.value.name,
		branches: branches as PluralBranches,
		...(Object.keys(exactBranches).length > 0 && { exactBranches }),
		form: props.form ?? 'cardinal',
	}
}

// Convert a Select construct and register its runtime value.
function convertSelect(element: ReactElement, context: ConversionContext): MessageNode {
	const props = element.props as SelectProps

	// Check/process the variable.
	if (!isTranslationVariable(props.value)) throw new Error('Select value must be created with variable(name, value).')
	addVariable(props.value.name, props.value.value, context)

	// Check/process the branches.
	const branches: Record<string, Message> = {}
	getSelectBranches(props.children).forEach(branch => {
		const branchProps = branch.props as SelectOtherProps
		const value = branch.type === Select.Other ? 'other' : (branch.props as SelectBranchProps).value
		if (!value) throw new Error('Select.Case requires a non-empty value.')
		if (branches[value]) throw new Error(`Select contains duplicate "${value}" branch.`)
		branches[value] = normalizeMessage(convertNode(branchProps.children, context))
	})
	if (!branches.other) throw new Error('Select requires a Select.Other branch.')

	// Return the outcome as a Message object.
	return { type: 'select', variable: props.value.name, branches: branches as SelectBranches }
}

/*
 * Support functions.
 */

// Get and validate the branches within a Plural construct.
function getPluralBranches(children: unknown): Array<{ branch: ReactElement, category: PluralCategory | 'exact' }> {
	return getElementChildren(children, 'Plural').map(branch => {
		const category = getPluralBranch(branch.type)
		if (!category) throw new Error('Plural may only contain Plural category or Plural.Exact children.')
		return { branch, category }
	})
}

// Get and validate the branches within a Select construct.
function getSelectBranches(children: unknown): ReactElement[] {
	const branches = getElementChildren(children, 'Select')
	if (branches.some(branch => !isSelectBranch(branch.type))) throw new Error('Select may only contain Select.Case or Select.Other children.')
	return branches
}

// Turn the children of a construct into a list of React elements.
function getElementChildren(children: unknown, construct: string): ReactElement[] {
	const nodes = Children.toArray(children as ReactNode)
	if (nodes.some(node => !isValidElement(node))) throw new Error(`${construct} may only contain React element children.`)
	return nodes as ReactElement[]
}

// Helper that adds a variable to the given context.
function addVariable(name: string, value: unknown, context: ConversionContext): void {
	if (context.variables.has(name) && !Object.is(context.variables.get(name), value)) throw new Error(`Translation variable "${name}" has multiple runtime values.`)
	context.variables.set(name, value)
}

// Helper to determine if a value is Iterable.
function isIterable(value: unknown): value is Iterable<unknown> {
	return typeof value === 'object' && value !== null && Symbol.iterator in value
}
