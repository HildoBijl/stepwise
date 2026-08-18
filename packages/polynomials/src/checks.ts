import { type NestedValue, getDimensions, isNumber } from '@step-wise/js-utils'

import { PolynomialExpression } from './types'

// Validate a polynomial expression and return it unchanged.
export function ensurePolynomialExpression(value: unknown): PolynomialExpression {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new TypeError('Invalid polynomial expression: expected an object.')

	const expression = value as Record<string, unknown>
	if (!Array.isArray(expression.list) || !expression.list.every(variable => typeof variable === 'string')) throw new TypeError('Invalid polynomial expression: expected "list" to be an array of strings.')
	if (expression.list.some(variable => variable.trim().length === 0)) throw new TypeError('Invalid polynomial expression: variable names cannot be empty.')
	if (new Set(expression.list).size !== expression.list.length) throw new RangeError('Invalid polynomial expression: variable names must be unique.')

	const dimensions = getDimensions(expression.matrix as NestedValue<number>, (value): value is number => isNumber(value) && Number.isFinite(value))
	if (dimensions.length !== expression.list.length) throw new RangeError(`Invalid polynomial expression: coefficient depth ${dimensions.length} does not match the number of variables ${expression.list.length}.`)
	if (dimensions.some(size => size === 0)) throw new RangeError('Invalid polynomial expression: coefficient dimensions cannot be empty.')

	return value as PolynomialExpression
}
