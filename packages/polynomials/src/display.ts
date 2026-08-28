import { isArray } from '@step-wise/js-utils'

import { type Polynomial, type PolynomialCoefficients, type PolynomialVariables } from './types.ts'
import { ensurePolynomial } from './checks.ts'

export function polynomialToString(polynomial: Polynomial): string {
	ensurePolynomial(polynomial)
	const result = coefficientsToString(polynomial.coefficients, polynomial.variables)
	return result[0] === '+' ? result.slice(1) : result
}

function coefficientsToString(coefficients: PolynomialCoefficients, variables: PolynomialVariables, exponents: number[] = []): string {
	if (!isArray(coefficients)) {
		if (coefficients === 0) return '0'
		const term = termToString(exponents, variables)
		if (coefficients === 1) return `+${term === '' ? '1' : term}`
		if (coefficients === -1) return `-${term === '' ? '1' : term}`
		if (coefficients > 0) return `+${coefficients}${term === '' ? '' : '*'}${term}`
		return `${coefficients}${term === '' ? '' : '*'}${term}`
	}
	let result = coefficients.map((child, exponent) => coefficientsToString(child, variables, [...exponents, exponent])).filter(term => term !== '0').join('')
	if (exponents.length === 0 && result[0] === '+') result = result.slice(1)
	return result.length === 0 ? '0' : result
}

function termToString(exponents: number[], variables: PolynomialVariables): string {
	if (exponents.length > variables.length) throw new Error(`Cannot display polynomial: there are more coefficient dimensions (${exponents.length}) than variables (${variables.length}).`)
	return exponents.map((exponent, index) => exponent === 0 ? undefined : exponent === 1 ? variables[index] : `${variables[index]}^${exponent}`).filter(term => term !== undefined).join('*')
}
