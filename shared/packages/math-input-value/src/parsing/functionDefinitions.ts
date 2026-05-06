import type { ExpressionInputValue } from '../types'
import { getEmptyExpression, getExpressionWithValue } from '../utils'

// Define for all special functions - those with specific behavior in the input type - what properties they have.
export type SpecialFunctionSettings = {
	hasParameterAfter?: boolean
	defaultArguments: ExpressionInputValue[]
}
export const specialFunctionSettings = {
	frac: {
		defaultArguments: [getEmptyExpression(), getEmptyExpression()],
	},
	subSup: {
		defaultArguments: [getEmptyExpression(), getEmptyExpression()],
	},
	log: {
		defaultArguments: [getEmptyExpression(), getExpressionWithValue('10')],
		hasParameterAfter: true,
	},
	sqrt: {
		defaultArguments: [getEmptyExpression()],
	},
	root: {
		defaultArguments: [getEmptyExpression(), getExpressionWithValue('2')],
	},
} satisfies Record<string, SpecialFunctionSettings>

// Add extra helper types and functions.
export type SpecialFunctionName = keyof typeof specialFunctionSettings
export const specialFunctions = Object.keys(specialFunctionSettings) as SpecialFunctionName[]
export function isSpecialFunction(name: string): name is SpecialFunctionName {
	return name in specialFunctionSettings
}
