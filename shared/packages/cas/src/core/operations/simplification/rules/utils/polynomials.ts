import { last, repeat, ensureInt } from '@step-wise/utils'

import { type ExpressionNode, type Variable, Integer, power, product, sum } from '../../../../construction'

import { subtract, multiply, divide, equalVariables, getVariables, isNumeric, isZero, isPolynomial, isPower, isVariable, numericNodeToNumber } from '../../../structural'

import { type SimplificationOptions, getSimplificationOptionsFromList, polynomialCancellationSimplificationOptionList } from '../../definitions'

import { getSumTerms, getConstantAndVariablePart } from './defaults'

type PolynomialGCDResult = { gcd: ExpressionNode, factors: [ExpressionNode, ExpressionNode] }
type Simplify = (node: ExpressionNode, options: Partial<SimplificationOptions>) => ExpressionNode
const coefficientSimplificationOptions = getSimplificationOptionsFromList(polynomialCancellationSimplificationOptionList)

// Try to find a polynomial GCD. On unsupported input, safely return gcd 1.
export function getPolynomialGCD(a: ExpressionNode, b: ExpressionNode, simplify: Simplify): PolynomialGCDResult {
	// Get the variable to run this on. If not valid, return defaults.
	const variable = getSinglePolynomialVariable(a, b)
	if (!variable) return { gcd: Integer.one, factors: [a, b] }

	// Find the coefficients. On a problem, return defaults.
	let aCoefficients = polynomialToCoefficients(a, variable)
	let bCoefficients = polynomialToCoefficients(b, variable)
	if (!aCoefficients || !bCoefficients) return { gcd: Integer.one, factors: [a, b] }

	// Find the GCD of the two polynomials.
	aCoefficients = trimCoefficients(simplifyCoefficients(aCoefficients, simplify))
	bCoefficients = trimCoefficients(simplifyCoefficients(bCoefficients, simplify))
	const gcdCoefficients = getPolynomialGCDFromCoefficients(aCoefficients, bCoefficients, simplify)
	if (gcdCoefficients.length <= 1) return { gcd: Integer.one, factors: [a, b] }

	// Divide the polynomials by their GCD.
	const aDivision = dividePolynomials(aCoefficients, gcdCoefficients, simplify)
	const bDivision = dividePolynomials(bCoefficients, gcdCoefficients, simplify)
	if (aDivision.remainder.length !== 0 || bDivision.remainder.length !== 0) return { gcd: Integer.one, factors: [a, b] }

	// Reassemble the polynomial for the output.
	return {
		gcd: coefficientsToPolynomial(gcdCoefficients, variable, simplify),
		factors: [
			coefficientsToPolynomial(aDivision.quotient, variable, simplify),
			coefficientsToPolynomial(bDivision.quotient, variable, simplify),
		],
	}
}

// Check that the two expressions are both polynomial and share a single variable. If not, return undefined.
function getSinglePolynomialVariable(a: ExpressionNode, b: ExpressionNode): Variable | undefined {
	if (!isPolynomial(a) || !isPolynomial(b)) return undefined
	const aVariables = getVariables(a)
	const bVariables = getVariables(b)
	if (aVariables.length !== 1 || bVariables.length !== 1) return undefined
	if (!equalVariables(aVariables[0], bVariables[0])) return undefined
	return aVariables[0]
}

// Get polynomial coefficient in ascending order: c[0] + c[1]x + c[2]x^2 + ...
function polynomialToCoefficients(node: ExpressionNode, variable: Variable): ExpressionNode[] | undefined {
	const coefficients: ExpressionNode[][] = []
	for (const term of getSumTerms(node)) {
		const { constantPart, variablePart } = getConstantAndVariablePart(term)
		const order = getTermOrder(variablePart, variable)
		if (order === undefined || !isNumeric(constantPart)) return undefined
		if (!coefficients[order]) coefficients[order] = []
		coefficients[order].push(constantPart)
	}
	return repeat(coefficients.length, index => sum(...(coefficients[index] ?? [])))
}

// Reassemble a polynomial from coefficients.
function coefficientsToPolynomial(coefficients: ExpressionNode[], variable: Variable, simplify: Simplify): ExpressionNode {
	return simplify(sum(...coefficients.map((coefficient, index) => product(coefficient, power(variable, index)))), coefficientSimplificationOptions)
}

// Find the order of a polynomial term with respect to a given variable. So 8*x^3 gives 3.
function getTermOrder(variablePart: ExpressionNode, variable: Variable): number | undefined {
	if (isNumeric(variablePart)) return 0
	if (isVariable(variablePart) && equalVariables(variablePart, variable)) return 1
	if (isPower(variablePart) && isVariable(variablePart.base) && equalVariables(variablePart.base, variable) && isNumeric(variablePart.exponent)) {
		const order = numericNodeToNumber(variablePart.exponent)
		return Number.isInteger(order) && order >= 0 ? order : undefined
	}
	return undefined
}

// Use the Euclidian algorithm to find the polynomial GCD. Returns a coefficient array.
function getPolynomialGCDFromCoefficients(a: ExpressionNode[], b: ExpressionNode[], simplify: Simplify): ExpressionNode[] {
	// Ensure a is longer.
	if (a.length < b.length) [a, b] = [b, a]

	// Run the Euclidian algorithm.
	while (b.length > 0) {
		const factor = divide(last(a), last(b))
		const subtraction = shiftCoefficients(multiplyCoefficients(b, factor), a.length - b.length)
		a = trimCoefficients(simplifyCoefficients(subtractCoefficients(a, subtraction), simplify))
		if (a.length < b.length) [a, b] = [b, a]
	}

	// Algorithm finished. 
	if (a.length === 0) return []
	const leadingCoefficient = last(a)
	return simplifyCoefficients(divideCoefficients(a, leadingCoefficient), simplify)
}

// Divide two polynomials.
function dividePolynomials(original: ExpressionNode[], divisor: ExpressionNode[], simplify: Simplify): { quotient: ExpressionNode[], remainder: ExpressionNode[] } {
	let remainder = [...original]
	const quotient: ExpressionNode[] = []
	while (remainder.length >= divisor.length) {
		const factor = divide(last(remainder), last(divisor))
		const shift = remainder.length - divisor.length
		quotient[shift] = factor
		remainder = trimCoefficients(simplifyCoefficients(subtractCoefficients(remainder, shiftCoefficients(multiplyCoefficients(divisor, factor), shift)), simplify))
	}
	return { remainder, quotient: trimCoefficients(simplifyCoefficients(quotient, simplify)) }
}

// Subtract two polynomials by their coefficients.
function subtractCoefficients(a: ExpressionNode[], b: ExpressionNode[]): ExpressionNode[] {
	const length = Math.max(a.length, b.length)
	return repeat(length, index => subtract(a[index], b[index]))
}

// Remove excess zeros from a polynomial.
function trimCoefficients(coefficients: ExpressionNode[]): ExpressionNode[] {
	const result = [...coefficients]
	while (result.length > 0 && isZero(last(result))) result.pop()
	return result
}

// Multiply a polynomial by a factor.
function multiplyCoefficients(coefficients: ExpressionNode[], factor: ExpressionNode): ExpressionNode[] {
	return coefficients.map(value => multiply(value, factor))
}

// Divide a polynomial by a factor.
function divideCoefficients(coefficients: ExpressionNode[], factor: ExpressionNode): ExpressionNode[] {
	return coefficients.map(value => divide(value, factor))
}

// Shift a polynomial by a given number of coefficients.
function shiftCoefficients(coefficients: ExpressionNode[], shift: number): ExpressionNode[] {
	return [...Array(ensureInt(shift, true)).fill(Integer.zero), ...coefficients]
}

// Run a simplification to all coefficients.
function simplifyCoefficients(coefficients: ExpressionNode[], simplify: Simplify): ExpressionNode[] {
	return coefficients.map(coefficient => simplify(coefficient, coefficientSimplificationOptions))
}
