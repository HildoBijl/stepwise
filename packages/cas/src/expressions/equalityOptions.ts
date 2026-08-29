import { hasOnlyKeys, isPlainObject, mergeDefaults, identity } from '@step-wise/js-utils'

import { type Expression } from './Expression.ts'

export type ExpressionPreprocessor = (expression: Expression) => Expression
export type ExpressionComparison = (input: Expression, expected: Expression) => boolean
export type ExpressionEqualityOptions = {
	allowOrderChanges: boolean // In expression lists, is x+y the same as y+x and is x*y the same as y*x?
	preprocess: ExpressionPreprocessor // What do we do with expressions before running a structural comparison?
}
export type ExpressionEqualityOptionsInput = Partial<ExpressionEqualityOptions>
export type ExpressionStructureComparisonOptions = Pick<ExpressionEqualityOptionsInput, 'allowOrderChanges'>

export const defaultExpressionEqualityOptions = {
	allowOrderChanges: true,
	preprocess: identity,
}

export function isExpressionEqualityOptionsInput(value: unknown): value is ExpressionEqualityOptionsInput {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['allowOrderChanges', 'preprocess'])) return false
	return (value.allowOrderChanges === undefined || typeof value.allowOrderChanges === 'boolean')
		&& (value.preprocess === undefined || typeof value.preprocess === 'function')
}
export function asExpressionEqualityOptions(options: ExpressionEqualityOptionsInput): ExpressionEqualityOptions {
	return mergeDefaults(options, defaultExpressionEqualityOptions)
}
