/*
 * General types.
 */

export type MessageNode = TextNode | VariableNode | ComponentNode | PluralNode | SelectNode | ConditionNode
export type Message = readonly MessageNode[]

export type TranslationStatus = 'current' | 'missing' | 'needs-review' | 'stale' | 'invalid'

/*
 * Elementary types.
 */

export type TextNode = {
	type: 'text'
	value: string
}

export type VariableNode = {
	type: 'variable'
	name: string
}

/*
 * Components.
 */

export type ComponentNode = {
	type: 'component'
	id: string
	component: string
	slots: Readonly<Record<string, Message>>
	copyOf?: string
}

/*
 * Plurals.
 */

export const pluralCategories = ['zero', 'one', 'two', 'few', 'many', 'other'] as const
export type PluralCategory = typeof pluralCategories[number]

export type PluralBranches = Readonly<Partial<Record<PluralCategory, Message>> & { other: Message }>

export type PluralNode = {
	type: 'plural'
	variable: string
	branches: PluralBranches
	exactBranches?: Readonly<Record<string, Message>>
	form?: 'cardinal' | 'ordinal'
}

/*
 * Select.
 */

export type SelectBranches = Readonly<Record<string, Message> & { other: Message }>

export type SelectNode = {
	type: 'select'
	variable: string
	branches: SelectBranches
}

/*
 * Condition.
 */

export type ConditionNode = {
	type: 'condition'
	variable: string
	true: Message
	false: Message
}
