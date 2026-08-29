import type { Polynomial } from './types.ts'
import { ensurePolynomial } from './checks.ts'

export function getUnivariatePolynomialCoefficients(polynomial: Polynomial): number[] {
	ensurePolynomial(polynomial)
	if (polynomial.variables.length !== 1) throw new RangeError(`Cannot get univariate polynomial coefficients: expected exactly one variable, but received ${polynomial.variables.length}.`)
	const degree = polynomial.terms.at(-1)?.exponents[0] ?? 0
	const coefficients = Array.from<number>({ length: degree + 1 }).fill(0)
	polynomial.terms.forEach(term => { coefficients[term.exponents[0]] = term.coefficient })
	return coefficients
}
