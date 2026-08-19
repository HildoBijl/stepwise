import { ensureInteger, ensureNumber, sum, cumulative } from '@step-wise/js-utils'
import { binomialCoefficient } from '@step-wise/math-tools'

import { BernsteinCoefficients } from './types'
import { getBernsteinOrder } from './fundamentals'

// Evaluate the Bernstein Polynomial for a set of coefficients and a given x.
function evaluateBernsteinPolynomial(coefficients: BernsteinCoefficients, x: number): number {
	const n = getBernsteinOrder(coefficients)
	return sum(coefficients.map((c, i) => c * binomialCoefficient(n, i) * x ** i * (1 - x) ** (n - i)))
}

// Get the PDF for the chance of success, given the coefficients.
export function getBernsteinPDF(coefficients: BernsteinCoefficients): (x: number) => number {
	return x => {
		x = ensureNumber(x, { allowInfinity: true })
		if (x < 0 || x > 1) return 0
		return evaluateBernsteinPolynomial(coefficients, x) * (getBernsteinOrder(coefficients) + 1)
	}
}

// Get the derivative of the PDF.
export function getBernsteinPDFDerivative(coefficients: BernsteinCoefficients): (x: number) => number {
	const n = getBernsteinOrder(coefficients)
	return x => {
		x = ensureNumber(x, { allowInfinity: true })
		if (x < 0 || x > 1) return 0
		if (n === 0) return 0
		return sum(coefficients.map((c, i) => {
			if (i === 0) return c * binomialCoefficient(n, i) * (-n * (1 - x) ** (n - 1))
			if (i === n) return c * binomialCoefficient(n, i) * (n * x ** (n - 1))
			return c * binomialCoefficient(n, i) * (i - n * x) * x ** (i - 1) * (1 - x) ** (n - i - 1)
		})) * (n + 1)
	}
}

// Get the CDF corresponding to the PDF with the given coefficients.
export function getBernsteinCDF(coefficients: BernsteinCoefficients): (x: number) => number {
	const cdfCoef = getBernsteinCDFCoefficients(coefficients)
	return x => {
		x = ensureNumber(x, { allowInfinity: true })
		if (x < 0) return 0
		if (x > 1) return 1
		return evaluateBernsteinPolynomial(cdfCoef, x) * (getBernsteinOrder(cdfCoef) + 1)
	}
}

// Get the coefficients for the CDF corresponding to a given PDF. These coefficients are not normalized.
function getBernsteinCDFCoefficients(coefficients: BernsteinCoefficients): BernsteinCoefficients {
	const n = getBernsteinOrder(coefficients)
	return cumulative([0, ...coefficients]).map(x => x / (n + 2))
}

// Get the inverse CDF by applying a binary search to the CDF for every call.
export function getInverseBernsteinCDF(coefficients: BernsteinCoefficients, numIterations = 20): (F: number) => number {
	const ensuredNumIterations = ensureInteger(numIterations, { nonNegative: true, nonZero: true, safe: true })
	const cdf = getBernsteinCDF(coefficients)

	return F => {
		F = ensureNumber(F, { nonNegative: true })
		if (F > 1) throw new RangeError(`Invalid inverse CDF input: received a number that is not a possible CDF output. The number must be between 0 and 1 (inclusive) but ${F} was given.`)
		if (F === 0) return 0
		if (F === 1) return 1

		let left = 0, right = 1
		for (let i = 0; i < ensuredNumIterations; i++) {
			const middle = (left + right) / 2
			const cdfValue = cdf(middle)
			if (cdfValue < F) left = middle
			else if (cdfValue > F) right = middle
			else break
		}
		return (left + right) / 2
	}
}

type BernsteinInterval = {
	left: number
	right: number
	coefficients: BernsteinCoefficients
	upperBound: number
}

// Split Bernstein coefficients into equivalent representations of the left and right halves of their interval.
function subdivideBernsteinCoefficients(coefficients: BernsteinCoefficients): [BernsteinCoefficients, BernsteinCoefficients] {
	let level = coefficients
	const left = [level[0]]
	const right = [level[level.length - 1]]
	while (level.length > 1) {
		level = level.slice(1).map((coefficient, index) => (level[index] + coefficient) / 2)
		left.push(level[0])
		right.push(level[level.length - 1])
	}
	return [left, right.reverse()]
}

// Get a numerical approximation of the global PDF maximum. Returns { x, f } with x the input and f the output.
export function getBernsteinPDFMaximum(coefficients: BernsteinCoefficients, numIterations = 20): { x: number, f: number } {
	const ensuredNumIterations = ensureInteger(numIterations, { nonNegative: true, nonZero: true, safe: true })
	const scale = getBernsteinOrder(coefficients) + 1
	let result = { x: 0, f: coefficients[0] * scale }
	const rightValue = coefficients[coefficients.length - 1] * scale
	if (rightValue > result.f) result = { x: 1, f: rightValue }

	const intervals: BernsteinInterval[] = [{ left: 0, right: 1, coefficients, upperBound: Math.max(...coefficients) * scale }]
	for (let iteration = 0; iteration < ensuredNumIterations; iteration++) {
		let bestIntervalIndex = 0
		for (let index = 1; index < intervals.length; index++) {
			if (intervals[index].upperBound > intervals[bestIntervalIndex].upperBound) bestIntervalIndex = index
		}
		const interval = intervals.splice(bestIntervalIndex, 1)[0]
		if (!interval || interval.upperBound <= result.f) break

		const middle = (interval.left + interval.right) / 2
		const [leftCoefficients, rightCoefficients] = subdivideBernsteinCoefficients(interval.coefficients)
		const middleValue = leftCoefficients[leftCoefficients.length - 1] * scale
		if (middleValue > result.f) result = { x: middle, f: middleValue }

		const leftInterval = { left: interval.left, right: middle, coefficients: leftCoefficients, upperBound: Math.max(...leftCoefficients) * scale }
		const rightInterval = { left: middle, right: interval.right, coefficients: rightCoefficients, upperBound: Math.max(...rightCoefficients) * scale }
		if (leftInterval.upperBound > result.f) intervals.push(leftInterval)
		if (rightInterval.upperBound > result.f) intervals.push(rightInterval)
	}
	return result
}
