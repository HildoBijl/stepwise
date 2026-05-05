import type { ExpressionInputValue } from '../types'
import { getEmptyExpression, getExpressionWithValue } from '../utils'

// Define for all special functions - those with specific behavior in the input type - what properties they have.
export type SpecialFunctionSettings = {
	hasParameterAfter?: boolean
	defaultArguments: ExpressionInputValue[]
}
export const advancedFunctionSettings = {
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
export type AdvancedFunctionName = keyof typeof advancedFunctionSettings
export const advancedFunctions = Object.keys(advancedFunctionSettings) as AdvancedFunctionName[]
export function isAdvancedFunction(name: string): name is AdvancedFunctionName {
	return name in advancedFunctionSettings
}
