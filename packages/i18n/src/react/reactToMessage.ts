import { Children, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react'

import { type ComponentNode, type Message, type MessageNode, type PluralBranches, type PluralCategory, type SelectBranches, normalizeMessage } from '../message/index.ts'

import { getTranslationComponentDefinition, type TranslationComponentDefinition } from './withTranslation.tsx'
import { type ExactPluralBranchProps, type PluralBranchProps, type PluralProps, getPluralBranch, isPluralConstruct, isPluralValue } from './Plural.tsx'
import { type SelectBranchProps, type SelectOtherProps, type SelectProps, Select, isSelectBranch, isSelectConstruct, isSelectValue } from './Select.tsx'
import { type TranslationVariable, getTranslationVariableShorthand, isTranslationVariable, isTranslationVariableShorthand, variable } from './variable.ts'

/*
 * Types.
 */

type ConversionContext = {
	nextComponentId: number
	components: Map<string, ReactComponentBinding>
	variables: Map<string, unknown>
	nextPluralVariableId: number
	pluralVariables: string[]
	nextSelectVariableId: number
	selectVariables: string[]
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
	const context: ConversionContext = {
		nextComponentId: 1,
		components: new Map(),
		variables: new Map(),
		nextPluralVariableId: 1,
		pluralVariables: [],
		nextSelectVariableId: 1,
		selectVariables: [],
	}
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
	if (isTranslationVariableShorthand(node)) {
		const shorthand = getTranslationVariableShorthand(node)
		addVariable(shorthand.name, shorthand.value, context)
		return [{ type: 'variable', name: shorthand.name }]
	}
	if (Array.isArray(node)) return node.flatMap(child => convertNode(child, context))
	if (isIterable(node)) return [...node].flatMap(child => convertNode(child, context))
	if (!isValidElement(node)) throw new Error('Unsupported value in translatable React content. Wrap runtime values with variable(name, value) or {{ name: value }}.')
	if (node.type === Fragment) return convertNode((node.props as { children?: unknown }).children, context)
	if (isPluralValue(node.type)) return [{ type: 'variable', name: getScopedVariable(context.pluralVariables, 'Plural.Value') }]
	if (isSelectValue(node.type)) return [{ type: 'variable', name: getScopedVariable(context.selectVariables, 'Select.Value') }]
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
	const variable = resolveConstructVariable(props.value, 'plural', context)
	if (typeof variable.value !== 'number' || !Number.isFinite(variable.value)) throw new Error('Plural value must be a finite number.')
	addVariable(variable.name, variable.value, context)

	// Check all the branches, sorting them by regular and exact branches.
	const branches: Partial<Record<PluralCategory, Message>> = {}
	const exactBranches: Record<string, Message> = {}
	context.pluralVariables.push(variable.name)
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
	context.pluralVariables.pop()
	if (!branches.other) throw new Error('Plural requires a Plural.Other branch.')

	// Return the outcome as Message object.
	return {
		type: 'plural',
		variable: variable.name,
		branches: branches as PluralBranches,
		...(Object.keys(exactBranches).length > 0 && { exactBranches }),
		form: props.form ?? 'cardinal',
	}
}

// Convert a Select construct and register its runtime value.
function convertSelect(element: ReactElement, context: ConversionContext): MessageNode {
	const props = element.props as SelectProps

	// Check/process the variable.
	const variable = resolveConstructVariable(props.value, 'select', context)
	if (!['string', 'number', 'boolean'].includes(typeof variable.value)) throw new Error('Select value must be a string, number, or boolean.')
	addVariable(variable.name, variable.value, context)

	// Check/process the branches.
	const branches: Record<string, Message> = {}
	context.selectVariables.push(variable.name)
	getSelectBranches(props.children).forEach(branch => {
		const branchProps = branch.props as SelectOtherProps
		const value = branch.type === Select.Other ? 'other' : (branch.props as SelectBranchProps).value
		if (!value) throw new Error('Select.Case requires a non-empty value.')
		if (branches[value]) throw new Error(`Select contains duplicate "${value}" branch.`)
		branches[value] = normalizeMessage(convertNode(branchProps.children, context))
	})
	context.selectVariables.pop()
	if (!branches.other) throw new Error('Select requires a Select.Other branch.')

	// Return the outcome as a Message object.
	return { type: 'select', variable: variable.name, branches: branches as SelectBranches }
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

// Resolve an explicit variable or assign a deterministic internal name to a raw construct value.
function resolveConstructVariable(value: unknown, construct: 'plural' | 'select', context: ConversionContext): TranslationVariable {
	if (isTranslationVariable(value)) return value
	if (isTranslationVariableShorthand(value)) return getTranslationVariableShorthand(value)
	const counter = construct === 'plural' ? context.nextPluralVariableId++ : context.nextSelectVariableId++
	return variable(`$${construct}${counter}`, value)
}

// Get the last variable name from a stack of tracked variables.
function getScopedVariable(variables: string[], component: string): string {
	const variable = variables.at(-1)
	if (!variable) throw new Error(`${component} must be used inside its corresponding construct.`)
	return variable
}

// Helper to determine if a value is Iterable.
function isIterable(value: unknown): value is Iterable<unknown> {
	return typeof value === 'object' && value !== null && Symbol.iterator in value
}
