import { Children, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react'

import { type ComponentNode, type Message, type MessageNode, type PluralBranches, type PluralCategory, type SelectBranches, normalizeMessage } from '../../message/index.ts'

import { type ConditionBranchProps, type ConditionProps, getConditionBranch, isConditionConstruct } from '../authoring/Condition.tsx'
import { type ExactPluralBranchProps, type PluralBranchProps, type PluralProps, getPluralBranch, isPluralConstruct, isPluralValue } from '../authoring/Plural.tsx'
import { type SelectBranchProps, type SelectOtherProps, type SelectProps, Select, isSelectBranch, isSelectConstruct, isSelectValue } from '../authoring/Select.tsx'
import { type TranslationVariable, type TranslationVariableShorthand, isTranslationVariable, isTranslationVariableShorthand, variable } from '../authoring/variable.ts'
import { type TranslationComponentDefinition, getTranslationComponentDefinition } from '../authoring/withTranslation.tsx'

/*
 * Types.
 */

type ConversionContext = {
	nextComponentId: number
	nextComponentTagId: number
	componentTags: Map<unknown, string>
	components: Map<string, ReactComponentBinding>
	variables: Map<string, unknown>
	nextPluralVariableId: number
	pluralVariables: string[]
	nextSelectVariableId: number
	selectVariables: string[]
	nextConditionVariableId: number
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
		nextComponentTagId: 1,
		componentTags: new Map(),
		components: new Map(),
		variables: new Map(),
		nextPluralVariableId: 1,
		pluralVariables: [],
		nextSelectVariableId: 1,
		selectVariables: [],
		nextConditionVariableId: 1,
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
		const shorthand = translationVariableFromShorthand(node)
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
	if (isConditionConstruct(node.type)) return [convertCondition(node, context)]
	return [convertElement(node, context)]
}

/*
 * Specific (type-defendent) react-to-message conversion.
 */

// Convert a regular React element to a component node and remember its original element.
function convertElement(element: ReactElement, context: ConversionContext): MessageNode {
	const definition = getTranslationComponentDefinition(element.type, () => getFallbackComponentTag(element.type, context))
	const id = `c${context.nextComponentId++}`

	// Turn the element's props into slots.
	const slots: Record<string, Message> = {}
	const props = element.props as Record<string, unknown>
	definition.translatedProps.forEach(prop => {
		// Deal with regular props.
		if (typeof prop === 'string') {
			if (props[prop] !== undefined) addSlot(slots, prop, props[prop], context)
			return
		}

		// Deal with array-valued props.
		const value = props[prop.name]
		if (value === undefined) return
		if (!Array.isArray(value)) throw new Error(`Translated array prop "${prop.name}" must be an array.`)
		value.forEach((item, index) => addSlot(slots, `${prop.itemName}-${index + 1}`, item, context))
	})

	// Assemble the data into a component message.
	const source = { type: 'component' as const, id, component: definition.tag, slots }
	context.components.set(id, { definition, element, source })
	return source
}

// Assign a stable numbered tag to each distinct unregistered component type within a Message.
function getFallbackComponentTag(component: unknown, context: ConversionContext): string {
	const existingTag = context.componentTags.get(component)
	if (existingTag) return existingTag
	const tag = `component-${context.nextComponentTagId++}`
	context.componentTags.set(component, tag)
	return tag
}

// Add a translated value as a named component slot, guarding against conflicting prop definitions.
function addSlot(slots: Record<string, Message>, name: string, value: unknown, context: ConversionContext): void {
	if (slots[name]) throw new Error(`Duplicate translated component slot "${name}".`)
	slots[name] = normalizeMessage(convertNode(value, context))
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

// Convert a boolean condition and register its runtime value.
function convertCondition(element: ReactElement, context: ConversionContext): MessageNode {
	const props = element.props as ConditionProps

	// Check/process the variable.
	const variable = resolveConstructVariable(props.value, 'condition', context)
	if (typeof variable.value !== 'boolean') throw new Error('Condition value must be a boolean.')
	addVariable(variable.name, variable.value, context)

	// Check/process the branches.
	const branches: { true?: Message, false?: Message } = {}
	getElementChildren(props.children, 'Condition').forEach(branch => {
		const value = getConditionBranch(branch.type)
		if (!value) throw new Error('Condition may only contain Condition.True or Condition.False children.')
		if (branches[value]) throw new Error(`Condition contains duplicate Condition.${value === 'true' ? 'True' : 'False'} branch.`)
		branches[value] = normalizeMessage(convertNode((branch.props as ConditionBranchProps).children, context))
	})

	// Return the outcome as a Message object.
	return { type: 'condition', variable: variable.name, true: branches.true ?? [], false: branches.false ?? [] }
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
function resolveConstructVariable(value: unknown, construct: 'plural' | 'select' | 'condition', context: ConversionContext): TranslationVariable {
	if (isTranslationVariable(value)) return value
	if (isTranslationVariableShorthand(value)) return translationVariableFromShorthand(value)
	const counter = construct === 'plural' ? context.nextPluralVariableId++ : construct === 'select' ? context.nextSelectVariableId++ : context.nextConditionVariableId++
	return variable(`$${construct}${counter}`, value)
}

// Turn the {{ name: value }} shorthand into a named translation variable.
function translationVariableFromShorthand(value: TranslationVariableShorthand): TranslationVariable {
	const name = Object.keys(value)[0]!
	return variable(name, value[name])
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
