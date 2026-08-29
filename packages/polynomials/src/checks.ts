import { type Polynomial, type PolynomialExponents, type PolynomialTerm, type PolynomialVariables } from './types.ts'
import { comparePolynomialExponents } from './support.ts'

export function ensurePolynomialVariables(value: unknown): PolynomialVariables {
	if (!Array.isArray(value) || !value.every(variable => typeof variable === 'string')) throw new TypeError('Invalid polynomial variables: expected an array of strings.')
	if (value.some(variable => variable.trim().length === 0)) throw new TypeError('Invalid polynomial variables: variable names cannot be empty.')
	if (new Set(value).size !== value.length) throw new RangeError('Invalid polynomial variables: variable names must be unique.')
	return value
}

export function ensurePolynomialExponents(value: unknown, numberOfVariables: number): PolynomialExponents {
	if (!Number.isSafeInteger(numberOfVariables) || numberOfVariables < 0) throw new RangeError('Invalid number of polynomial variables: expected a non-negative safe integer.')
	if (!Array.isArray(value)) throw new TypeError('Invalid polynomial exponents: expected an array.')
	if (value.length !== numberOfVariables) throw new RangeError(`Invalid polynomial exponents: expected ${numberOfVariables} exponents, but received ${value.length}.`)
	if (!value.every(exponent => Number.isSafeInteger(exponent) && exponent >= 0)) throw new RangeError('Invalid polynomial exponents: expected non-negative safe integers.')
	return value as number[]
}

export function ensurePolynomialTerm(value: unknown, numberOfVariables: number): PolynomialTerm {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new TypeError('Invalid polynomial term: expected an object.')
	const term = value as Record<string, unknown>
	if (typeof term.coefficient !== 'number' || !Number.isFinite(term.coefficient)) throw new TypeError('Invalid polynomial term: coefficient must be a finite number.')
	if (term.coefficient === 0) throw new RangeError('Invalid polynomial term: coefficient cannot be zero.')
	ensurePolynomialExponents(term.exponents, numberOfVariables)
	return value as PolynomialTerm
}

export function ensurePolynomial(value: unknown): Polynomial {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new TypeError('Invalid polynomial: expected an object.')
	const polynomial = value as Record<string, unknown>
	const variables = ensurePolynomialVariables(polynomial.variables)
	if (!Array.isArray(polynomial.terms)) throw new TypeError('Invalid polynomial: terms must be an array.')
	const terms = polynomial.terms.map(term => ensurePolynomialTerm(term, variables.length))
	terms.slice(1).forEach((term, index) => {
		const comparison = comparePolynomialExponents(terms[index].exponents, term.exponents)
		if (comparison === 0) throw new RangeError('Invalid polynomial: terms cannot have duplicate exponent vectors.')
		if (comparison > 0) throw new RangeError('Invalid polynomial: terms must be ordered by their exponent vectors.')
	})
	return value as Polynomial
}
