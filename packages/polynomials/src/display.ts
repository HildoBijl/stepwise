import { type Polynomial, type PolynomialTerm, type PolynomialVariables } from './types.ts'
import { ensurePolynomial } from './checks.ts'

export function polynomialToString(polynomial: Polynomial): string {
	ensurePolynomial(polynomial)
	if (polynomial.terms.length === 0) return '0'
	const result = polynomial.terms.map(term => termToString(term, polynomial.variables)).join('')
	return result[0] === '+' ? result.slice(1) : result
}

function termToString(term: PolynomialTerm, variables: PolynomialVariables): string {
	const variablePart = term.exponents
		.map((exponent, index) => exponent === 0 ? undefined : exponent === 1 ? variables[index] : `${variables[index]}^${exponent}`)
		.filter(factor => factor !== undefined)
		.join('*')
	if (Math.abs(term.coefficient) === 1) return `${term.coefficient > 0 ? '+' : '-'}${variablePart === '' ? '1' : variablePart}`
	return `${term.coefficient > 0 ? '+' : ''}${term.coefficient}${variablePart === '' ? '' : '*'}${variablePart}`
}
