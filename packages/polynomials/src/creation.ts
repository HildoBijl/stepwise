import { ensureNumber } from '@step-wise/js-utils'

import { type Polynomial, type PolynomialCoefficients, type PolynomialVariables } from './types.ts'
import { ensurePolynomial } from './checks.ts'

export function createPolynomial(coefficients: PolynomialCoefficients, variables: PolynomialVariables): Polynomial {
	return ensurePolynomial({ coefficients, variables })
}

export function createConstantPolynomial(value: number): Polynomial {
	return createPolynomial(ensureNumber(value), [])
}
