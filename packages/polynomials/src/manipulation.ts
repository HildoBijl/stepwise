import { ensureInteger, ensureNumber, repeat, union } from '@step-wise/js-utils'

import { type Polynomial, type PolynomialTerms, type PolynomialVariables } from './types.ts'
import { ensurePolynomial, ensurePolynomialVariables } from './checks.ts'
import { createPolynomial } from './creation.ts'
import { alignPolynomialVariables } from './restructuring.ts'

export function negatePolynomial(polynomial: Polynomial): Polynomial {
	return scalePolynomial(polynomial, -1)
}

export function addConstantToPolynomial(polynomial: Polynomial, addition: number): Polynomial {
	ensurePolynomial(polynomial)
	const ensuredAddition = ensureNumber(addition)
	return createPolynomial([
		...polynomial.terms,
		{ coefficient: ensuredAddition, exponents: polynomial.variables.map(() => 0) },
	], polynomial.variables)
}

export function scalePolynomial(polynomial: Polynomial, factor: number): Polynomial {
	ensurePolynomial(polynomial)
	const ensuredFactor = ensureNumber(factor)
	return createPolynomial(polynomial.terms.map(term => ({ coefficient: term.coefficient * ensuredFactor, exponents: term.exponents })), polynomial.variables)
}

export function oneMinusPolynomial(polynomial: Polynomial): Polynomial {
	return addConstantToPolynomial(negatePolynomial(polynomial), 1)
}

export function addPolynomials(polynomials: readonly Polynomial[], variables?: PolynomialVariables): Polynomial {
	if (polynomials.length === 0) throw new RangeError('Cannot add polynomials: expected at least one polynomial.')
	polynomials.forEach(ensurePolynomial)
	variables ??= [...union(...polynomials.map(polynomial => new Set(polynomial.variables)))]
	ensurePolynomialVariables(variables)
	return createPolynomial(polynomials.flatMap(polynomial => alignPolynomialVariables(polynomial, variables).terms), variables)
}

export function subtractPolynomials(minuend: Polynomial, subtrahend: Polynomial, variables?: PolynomialVariables): Polynomial {
	return addPolynomials([minuend, negatePolynomial(subtrahend)], variables)
}

export function multiplyPolynomials(polynomials: readonly Polynomial[], variables?: PolynomialVariables): Polynomial {
	if (polynomials.length === 0) throw new RangeError('Cannot multiply polynomials: expected at least one polynomial.')
	polynomials.forEach(ensurePolynomial)
	variables ??= [...union(...polynomials.map(polynomial => new Set(polynomial.variables)))]
	ensurePolynomialVariables(variables)
	const alignedPolynomials = polynomials.map(polynomial => alignPolynomialVariables(polynomial, variables))
	const identity = createPolynomial([{ coefficient: 1, exponents: variables.map(() => 0) }], variables)
	return alignedPolynomials.reduce(multiplyAlignedPolynomials, identity)
}

export function raisePolynomialToPower(polynomial: Polynomial, exponent: number): Polynomial {
	ensurePolynomial(polynomial)
	let remainingExponent = ensureInteger(exponent, { nonNegative: true, safe: true })
	let result = createPolynomial([{ coefficient: 1, exponents: polynomial.variables.map(() => 0) }], polynomial.variables)
	let factor = polynomial
	while (remainingExponent > 0) {
		if (remainingExponent % 2 === 1) result = multiplyAlignedPolynomials(result, factor)
		remainingExponent = Math.floor(remainingExponent / 2)
		if (remainingExponent > 0) factor = multiplyAlignedPolynomials(factor, factor)
	}
	return result
}

export function getPolynomialPowers(polynomial: Polynomial, maxExponent: number): Polynomial[] {
	ensurePolynomial(polynomial)
	const ensuredMaxExponent = ensureInteger(maxExponent, { nonNegative: true, safe: true })
	const identity = createPolynomial([{ coefficient: 1, exponents: polynomial.variables.map(() => 0) }], polynomial.variables)
	let power = identity
	return repeat(ensuredMaxExponent + 1, exponent => {
		if (exponent > 0) power = multiplyAlignedPolynomials(power, polynomial)
		return power
	})
}

function multiplyAlignedPolynomials(polynomial1: Polynomial, polynomial2: Polynomial): Polynomial {
	const terms: PolynomialTerms = polynomial1.terms.flatMap(term1 => polynomial2.terms.map(term2 => ({
		coefficient: term1.coefficient * term2.coefficient,
		exponents: term1.exponents.map((exponent, index) => exponent + term2.exponents[index]),
	})))
	return createPolynomial(terms, polynomial1.variables)
}
