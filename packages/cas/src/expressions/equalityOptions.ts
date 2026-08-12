import { mergeDefaults, identity } from '@step-wise/utils'

import { type Expression } from './Expression'

export type ExpressionPreprocess = (expression: Expression) => Expression
export type ExpressionComparison = (input: Expression, correct: Expression) => boolean
export type ExpressionEqualityOptions = {
	allowOrderChanges: boolean // In expression lists, is x+y the same as y+x and is x*y the same as y*x?
	preprocess: ExpressionPreprocess // What do we do with expressions before running a structural comparison?
}
export type ExpressionEqualityOptionsInput = Partial<ExpressionEqualityOptions>

export const defaultExpressionEqualityOptions = {
	allowOrderChanges: true,
	preprocess: identity,
}
export function asExpressionEqualityOptions(options: ExpressionEqualityOptionsInput): ExpressionEqualityOptions {
	return mergeDefaults(options, defaultExpressionEqualityOptions)
}
