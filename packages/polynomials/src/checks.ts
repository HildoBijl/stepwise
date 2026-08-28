import { type NestedValue, getDimensions, isNumber } from '@step-wise/js-utils'

import { type Polynomial, type PolynomialVariables } from './types.ts'

export function ensurePolynomialVariables(value: unknown): PolynomialVariables {
	if (!Array.isArray(value) || !value.every(variable => typeof variable === 'string')) throw new TypeError('Invalid polynomial variables: expected an array of strings.')
	if (value.some(variable => variable.trim().length === 0)) throw new TypeError('Invalid polynomial variables: variable names cannot be empty.')
	if (new Set(value).size !== value.length) throw new RangeError('Invalid polynomial variables: variable names must be unique.')
	return value
}

export function ensurePolynomial(value: unknown): Polynomial {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new TypeError('Invalid polynomial: expected an object.')
	const polynomial = value as Record<string, unknown>
	const variables = ensurePolynomialVariables(polynomial.variables)
	const dimensions = getDimensions(polynomial.coefficients as NestedValue<number>, (coefficient): coefficient is number => isNumber(coefficient) && Number.isFinite(coefficient))
	if (dimensions.length !== variables.length) throw new RangeError(`Invalid polynomial: coefficient depth ${dimensions.length} does not match the number of variables ${variables.length}.`)
	if (dimensions.some(size => size === 0)) throw new RangeError('Invalid polynomial: coefficient dimensions cannot be empty.')
	return value as Polynomial
}
