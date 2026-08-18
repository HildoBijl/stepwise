import { ensureInteger, ensureNumber, getDimensions, getMatrixElement, isNumber, repeat, repeatMultidimensional, repeatMultidimensionalFromTo, sum, union } from '@step-wise/js-utils'

import { type NonEmptyPolynomialList, type Polynomial, type PolynomialCoefficients, type PolynomialVariables } from './types'
import { ensurePolynomial, ensurePolynomialVariables } from './checks'
import { alignPolynomialVariables } from './restructuring'

function mapPolynomialCoefficients(polynomial: Polynomial, operation: (coefficients: PolynomialCoefficients) => PolynomialCoefficients): Polynomial {
	return { ...polynomial, coefficients: operation(polynomial.coefficients) }
}

export function negatePolynomial(polynomial: Polynomial): Polynomial {
	ensurePolynomial(polynomial)
	return scalePolynomial(polynomial, -1)
}

function addConstant(coefficients: PolynomialCoefficients, addition: number): PolynomialCoefficients {
	if (!Array.isArray(coefficients)) return coefficients + addition
	return [addConstant(coefficients[0], addition), ...coefficients.slice(1)]
}

export function addConstantToPolynomial(polynomial: Polynomial, addition: number): Polynomial {
	ensurePolynomial(polynomial)
	const ensuredAddition = ensureNumber(addition)
	return mapPolynomialCoefficients(polynomial, coefficients => addConstant(coefficients, ensuredAddition))
}

function scaleCoefficients(coefficients: PolynomialCoefficients, factor: number): PolynomialCoefficients {
	if (!Array.isArray(coefficients)) return coefficients * factor
	return coefficients.map(child => scaleCoefficients(child, factor))
}

export function scalePolynomial(polynomial: Polynomial, factor: number): Polynomial {
	ensurePolynomial(polynomial)
	const ensuredFactor = ensureNumber(factor)
	return mapPolynomialCoefficients(polynomial, coefficients => scaleCoefficients(coefficients, ensuredFactor))
}

export function oneMinusPolynomial(polynomial: Polynomial): Polynomial {
	ensurePolynomial(polynomial)
	return addConstantToPolynomial(negatePolynomial(polynomial), 1)
}

function addAlignedCoefficients(allCoefficients: readonly PolynomialCoefficients[]): PolynomialCoefficients {
	const allDimensions = allCoefficients.map(coefficients => getDimensions(coefficients, isNumber))
	const dimensions = repeat(allDimensions[0].length, index => Math.max(...allDimensions.map(item => item[index])))
	return repeatMultidimensional(dimensions, (...indices) => sum(allCoefficients.map(coefficients => getMatrixElement(coefficients, indices, isNumber, true) ?? 0)))
}

export function addPolynomials(polynomials: NonEmptyPolynomialList, variables?: PolynomialVariables): Polynomial {
	if (polynomials.length === 0) throw new RangeError('Cannot add polynomials: expected at least one polynomial.')
	polynomials.forEach(ensurePolynomial)
	variables ??= [...union(...polynomials.map(polynomial => new Set(polynomial.variables)))]
	ensurePolynomialVariables(variables)
	return { coefficients: addAlignedCoefficients(polynomials.map(polynomial => alignPolynomialVariables(polynomial, variables).coefficients)), variables }
}

export function subtractPolynomials(minuend: Polynomial, subtrahend: Polynomial, variables?: PolynomialVariables): Polynomial {
	ensurePolynomial(minuend)
	ensurePolynomial(subtrahend)
	return addPolynomials([minuend, negatePolynomial(subtrahend)], variables)
}

function multiplyTwoAlignedCoefficients(coefficients1: PolynomialCoefficients, coefficients2: PolynomialCoefficients): PolynomialCoefficients {
	const dimensions1 = getDimensions(coefficients1, isNumber)
	const dimensions2 = getDimensions(coefficients2, isNumber)
	if (dimensions1.length !== dimensions2.length) throw new Error(`Cannot multiply polynomial coefficients with depths ${dimensions1.length} and ${dimensions2.length}.`)
	const dimensions = repeat(dimensions1.length, index => dimensions1[index] + dimensions2[index] - 1)
	return repeatMultidimensional(dimensions, (...indices) => {
		const ranges = repeat(dimensions.length, index => ({ min: Math.max(0, indices[index] - dimensions2[index] + 1), max: Math.min(indices[index], dimensions1[index] - 1) }))
		let total = 0
		repeatMultidimensionalFromTo(ranges.map(range => range.min), ranges.map(range => range.max), (...indices1) => {
			const indices2 = repeat(dimensions.length, index => indices[index] - indices1[index])
			total += getMatrixElement(coefficients1, indices1, isNumber) * getMatrixElement(coefficients2, indices2, isNumber)
		})
		return total
	})
}

function multiplyAlignedCoefficients(allCoefficients: readonly PolynomialCoefficients[]): PolynomialCoefficients {
	return allCoefficients.slice(1).reduce((result, coefficients) => multiplyTwoAlignedCoefficients(result, coefficients), allCoefficients[0])
}

export function multiplyPolynomials(polynomials: NonEmptyPolynomialList, variables?: PolynomialVariables): Polynomial {
	if (polynomials.length === 0) throw new RangeError('Cannot multiply polynomials: expected at least one polynomial.')
	polynomials.forEach(ensurePolynomial)
	variables ??= [...union(...polynomials.map(polynomial => new Set(polynomial.variables)))]
	ensurePolynomialVariables(variables)
	return { coefficients: multiplyAlignedCoefficients(polynomials.map(polynomial => alignPolynomialVariables(polynomial, variables).coefficients)), variables }
}

function coefficientsToPower(coefficients: PolynomialCoefficients, exponent: number): PolynomialCoefficients {
	const ensuredExponent = ensureInteger(exponent, true)
	if (ensuredExponent === 1) return coefficients
	const identity = repeatMultidimensional(getDimensions(coefficients, isNumber).map(() => 1), () => 1)
	if (ensuredExponent === 0) return identity

	let result = identity
	let factor = coefficients
	let remainingExponent = ensuredExponent
	while (remainingExponent > 0) {
		if (remainingExponent % 2 === 1) result = multiplyTwoAlignedCoefficients(result, factor)
		remainingExponent = Math.floor(remainingExponent / 2)
		if (remainingExponent > 0) factor = multiplyTwoAlignedCoefficients(factor, factor)
	}
	return result
}

export function raisePolynomialToPower(polynomial: Polynomial, exponent: number): Polynomial {
	ensurePolynomial(polynomial)
	return mapPolynomialCoefficients(polynomial, coefficients => coefficientsToPower(coefficients, exponent))
}

export function getPolynomialPowers(polynomial: Polynomial, maxExponent: number): Polynomial[] {
	ensurePolynomial(polynomial)
	const ensuredMaxExponent = ensureInteger(maxExponent, true)
	let coefficients = polynomial.coefficients
	return repeat(ensuredMaxExponent + 1, exponent => {
		if (exponent === 0) return { coefficients: coefficientsToPower(polynomial.coefficients, 0), variables: polynomial.variables }
		if (exponent > 1) coefficients = multiplyTwoAlignedCoefficients(polynomial.coefficients, coefficients)
		return { coefficients, variables: polynomial.variables }
	})
}
