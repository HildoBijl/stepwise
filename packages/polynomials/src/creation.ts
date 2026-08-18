import { type Polynomial, type PolynomialCoefficients, type PolynomialVariables } from './types'
import { ensurePolynomial } from './checks'

export function createPolynomial(coefficients: PolynomialCoefficients, variables: PolynomialVariables): Polynomial {
	return ensurePolynomial({ coefficients, variables })
}

export function createConstantPolynomial(value: number): Polynomial {
	return createPolynomial(value, [])
}
