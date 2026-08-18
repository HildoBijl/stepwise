import { compareNumberArrays, compareNumbers } from '@step-wise/js-utils'

import { type Polynomial, type PolynomialCoefficients, type PolynomialComparisonOptions } from './types'
import { ensurePolynomial } from './checks'
import { alignPolynomialVariables } from './restructuring'

export function comparePolynomialCoefficients(coefficients1: PolynomialCoefficients, coefficients2: PolynomialCoefficients): boolean {
	if (Array.isArray(coefficients1)) return Array.isArray(coefficients2) && compareNumberArrays(coefficients1, coefficients2)
	return !Array.isArray(coefficients2) && compareNumbers(coefficients1, coefficients2)
}

export function comparePolynomials(polynomial1: Polynomial, polynomial2: Polynomial, options: PolynomialComparisonOptions = {}): boolean {
	ensurePolynomial(polynomial1)
	ensurePolynomial(polynomial2)
	if (polynomial1.variables.length !== polynomial2.variables.length || polynomial1.variables.some(variable => !polynomial2.variables.includes(variable))) return false
	if (options.allowVariableReordering === false) return polynomial1.variables.every((variable, index) => variable === polynomial2.variables[index]) && comparePolynomialCoefficients(polynomial1.coefficients, polynomial2.coefficients)
	return comparePolynomialCoefficients(polynomial1.coefficients, alignPolynomialVariables(polynomial2, polynomial1.variables).coefficients)
}
