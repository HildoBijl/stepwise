import type { ExpressionInputValue } from '../types'
import { getEmptyExpression, getExpressionWith } from '../utils'

// Define for all special functions - those with specific behavior in the input type - what properties they have.
export type ConstructSettings = {
	hasParameterAfter?: boolean
	defaultArguments: ExpressionInputValue[]
}
export const constructSettings = {
	frac: {
		defaultArguments: [getEmptyExpression(), getEmptyExpression()],
	},
	subSup: {
		defaultArguments: [getEmptyExpression(), getEmptyExpression()],
	},
	log: {
		defaultArguments: [getEmptyExpression(), getExpressionWith('10')],
		hasParameterAfter: true,
	},
	sqrt: {
		defaultArguments: [getEmptyExpression()],
	},
	root: {
		defaultArguments: [getEmptyExpression(), getExpressionWith('2')],
	},
} satisfies Record<string, ConstructSettings>

// Add extra helper types and functions.
export type ConstructName = keyof typeof constructSettings
export const constructs = Object.keys(constructSettings) as ConstructName[]
export function isConstructName(name: string): name is ConstructName {
	return name in constructSettings
}
