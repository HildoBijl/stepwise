import { approximatelyEqual } from '@step-wise/js-utils'

import { type Polynomial, type PolynomialComparisonOptions, type PolynomialTerms } from './types.ts'
import { ensurePolynomial } from './checks.ts'
import { alignPolynomialVariables } from './restructuring.ts'

export function comparePolynomialTerms(terms1: PolynomialTerms, terms2: PolynomialTerms): boolean {
	return terms1.length === terms2.length && terms1.every((term1, termIndex) => {
		const term2 = terms2[termIndex]
		return term1.exponents.length === term2.exponents.length
			&& term1.exponents.every((exponent, exponentIndex) => exponent === term2.exponents[exponentIndex])
			&& approximatelyEqual(term1.coefficient, term2.coefficient)
	})
}

export function comparePolynomials(polynomial1: Polynomial, polynomial2: Polynomial, options: PolynomialComparisonOptions = {}): boolean {
	ensurePolynomial(polynomial1)
	ensurePolynomial(polynomial2)
	if (polynomial1.variables.length !== polynomial2.variables.length || polynomial1.variables.some(variable => !polynomial2.variables.includes(variable))) return false
	if (options.allowVariableReordering === false) return polynomial1.variables.every((variable, index) => variable === polynomial2.variables[index]) && comparePolynomialTerms(polynomial1.terms, polynomial2.terms)
	return comparePolynomialTerms(polynomial1.terms, alignPolynomialVariables(polynomial2, polynomial1.variables).terms)
}
