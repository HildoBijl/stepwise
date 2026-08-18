import { type NestedValue, getDimensions, isNumber } from '@step-wise/js-utils'

import { type PolynomialExpression } from './types'

// Validate a variable list and return it unchanged.
export function ensureVariableList(value: unknown): string[] {
	if (!Array.isArray(value) || !value.every(variable => typeof variable === 'string')) throw new TypeError('Invalid variable list: expected an array of strings.')
	if (value.some(variable => variable.trim().length === 0)) throw new TypeError('Invalid variable list: variable names cannot be empty.')
	if (new Set(value).size !== value.length) throw new RangeError('Invalid variable list: variable names must be unique.')
	return value
}

// Validate a polynomial expression and return it unchanged.
export function ensurePolynomialExpression(value: unknown): PolynomialExpression {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new TypeError('Invalid polynomial expression: expected an object.')

	const expression = value as Record<string, unknown>
	const list = ensureVariableList(expression.list)

	const dimensions = getDimensions(expression.matrix as NestedValue<number>, (value): value is number => isNumber(value) && Number.isFinite(value))
	if (dimensions.length !== list.length) throw new RangeError(`Invalid polynomial expression: coefficient depth ${dimensions.length} does not match the number of variables ${list.length}.`)
	if (dimensions.some(size => size === 0)) throw new RangeError('Invalid polynomial expression: coefficient dimensions cannot be empty.')

	return value as PolynomialExpression
}
