import { ensureNumber } from '@step-wise/js-utils'

import { type Polynomial, type PolynomialExponents, type PolynomialTerms, type PolynomialVariables } from './types.ts'
import { comparePolynomialExponents, getPolynomialExponentsKey } from './support.ts'
import { ensurePolynomial, ensurePolynomialExponents, ensurePolynomialVariables } from './checks.ts'

export function createPolynomial(terms: PolynomialTerms, variables: PolynomialVariables): Polynomial {
	ensurePolynomialVariables(variables)
	if (!Array.isArray(terms)) throw new TypeError('Invalid polynomial terms: expected an array.')

	const termsByExponents = new Map<string, { coefficient: number, exponents: PolynomialExponents }>()
	terms.forEach(term => {
		if (typeof term !== 'object' || term === null || Array.isArray(term)) throw new TypeError('Invalid polynomial term: expected an object.')
		const coefficient = ensureNumber(term.coefficient)
		const exponents = [...ensurePolynomialExponents(term.exponents, variables.length)]
		if (coefficient === 0) return
		const key = getPolynomialExponentsKey(exponents)
		const combinedCoefficient = (termsByExponents.get(key)?.coefficient ?? 0) + coefficient
		if (!Number.isFinite(combinedCoefficient)) throw new RangeError('Invalid polynomial: combining terms produced a non-finite coefficient.')
		if (combinedCoefficient === 0) termsByExponents.delete(key)
		else termsByExponents.set(key, { coefficient: combinedCoefficient, exponents })
	})

	const canonicalTerms = [...termsByExponents.values()].sort((term1, term2) => comparePolynomialExponents(term1.exponents, term2.exponents))
	return ensurePolynomial({ terms: canonicalTerms, variables })
}

export function createConstantPolynomial(value: number): Polynomial {
	const coefficient = ensureNumber(value)
	return createPolynomial(coefficient === 0 ? [] : [{ coefficient, exponents: [] }], [])
}
