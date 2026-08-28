import { ensureInteger, ensureNumber, sum, cumulative } from '@step-wise/js-utils'
import { binomialCoefficient } from '@step-wise/math-tools'

import { type BernsteinCoefficients, getBernsteinDegree } from './fundamentals.ts'

export type BernsteinApproximationOptions = {
	iterations?: number
}

export type BernsteinPDFMaximum = {
	x: number
	density: number
}

const defaultApproximationIterations = 20

// Evaluate the Bernstein Polynomial for a set of coefficients and a given x.
function evaluateBernsteinPolynomial(coefficients: BernsteinCoefficients, x: number): number {
	const degree = getBernsteinDegree(coefficients)
	return sum(coefficients.map((coefficient, index) => coefficient * binomialCoefficient(degree, index) * x ** index * (1 - x) ** (degree - index)))
}

// Get the PDF for the chance of success, given the coefficients.
export function getBernsteinPDF(coefficients: BernsteinCoefficients): (x: number) => number {
	return x => {
		x = ensureNumber(x, { allowInfinity: true })
		if (x < 0 || x > 1) return 0
		return evaluateBernsteinPolynomial(coefficients, x) * (getBernsteinDegree(coefficients) + 1)
	}
}

// Get the derivative of the PDF.
export function getBernsteinPDFDerivative(coefficients: BernsteinCoefficients): (x: number) => number {
	const degree = getBernsteinDegree(coefficients)
	return x => {
		x = ensureNumber(x, { allowInfinity: true })
		if (x < 0 || x > 1) return 0
		if (degree === 0) return 0
		return sum(coefficients.map((coefficient, index) => {
			if (index === 0) return coefficient * binomialCoefficient(degree, index) * (-degree * (1 - x) ** (degree - 1))
			if (index === degree) return coefficient * binomialCoefficient(degree, index) * (degree * x ** (degree - 1))
			return coefficient * binomialCoefficient(degree, index) * (index - degree * x) * x ** (index - 1) * (1 - x) ** (degree - index - 1)
		})) * (degree + 1)
	}
}

// Get the CDF corresponding to the PDF with the given coefficients.
export function getBernsteinCDF(coefficients: BernsteinCoefficients): (x: number) => number {
	const cdfCoefficients = getBernsteinCDFCoefficients(coefficients)
	return x => {
		x = ensureNumber(x, { allowInfinity: true })
		if (x < 0) return 0
		if (x > 1) return 1
		return evaluateBernsteinPolynomial(cdfCoefficients, x) * (getBernsteinDegree(cdfCoefficients) + 1)
	}
}

// Get the coefficients for the CDF corresponding to a given PDF. These coefficients are not normalized.
function getBernsteinCDFCoefficients(coefficients: BernsteinCoefficients): BernsteinCoefficients {
	const degree = getBernsteinDegree(coefficients)
	return cumulative([0, ...coefficients]).map(value => value / (degree + 2))
}

// Get the quantile function by applying a binary search to the CDF for every call.
export function getBernsteinQuantileFunction(coefficients: BernsteinCoefficients, options: BernsteinApproximationOptions = {}): (probability: number) => number {
	const iterations = ensureInteger(options.iterations ?? defaultApproximationIterations, { nonNegative: true, nonZero: true, safe: true })
	const cdf = getBernsteinCDF(coefficients)

	return probability => {
		probability = ensureNumber(probability, { nonNegative: true })
		if (probability > 1) throw new RangeError(`Invalid quantile input: expected a probability between 0 and 1 (inclusive) but received ${probability}.`)
		if (probability === 0) return 0
		if (probability === 1) return 1

		let left = 0, right = 1
		for (let iteration = 0; iteration < iterations; iteration++) {
			const middle = (left + right) / 2
			const cdfValue = cdf(middle)
			if (cdfValue < probability) left = middle
			else if (cdfValue > probability) right = middle
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

// Split Bernstein coefficients into areEquivalent representations of the left and right halves of their interval.
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

// Get a numerical approximation of the global PDF maximum.
export function getBernsteinPDFMaximum(coefficients: BernsteinCoefficients, options: BernsteinApproximationOptions = {}): BernsteinPDFMaximum {
	const iterations = ensureInteger(options.iterations ?? defaultApproximationIterations, { nonNegative: true, nonZero: true, safe: true })
	const scale = getBernsteinDegree(coefficients) + 1
	let result = { x: 0, density: coefficients[0] * scale }
	const rightValue = coefficients[coefficients.length - 1] * scale
	if (rightValue > result.density) result = { x: 1, density: rightValue }

	const intervals: BernsteinInterval[] = [{ left: 0, right: 1, coefficients, upperBound: Math.max(...coefficients) * scale }]
	for (let iteration = 0; iteration < iterations; iteration++) {
		let bestIntervalIndex = 0
		for (let index = 1; index < intervals.length; index++) {
			if (intervals[index].upperBound > intervals[bestIntervalIndex].upperBound) bestIntervalIndex = index
		}
		const interval = intervals.splice(bestIntervalIndex, 1)[0]
		if (!interval || interval.upperBound <= result.density) break

		const middle = (interval.left + interval.right) / 2
		const [leftCoefficients, rightCoefficients] = subdivideBernsteinCoefficients(interval.coefficients)
		const middleValue = leftCoefficients[leftCoefficients.length - 1] * scale
		if (middleValue > result.density) result = { x: middle, density: middleValue }

		const leftInterval = { left: interval.left, right: middle, coefficients: leftCoefficients, upperBound: Math.max(...leftCoefficients) * scale }
		const rightInterval = { left: middle, right: interval.right, coefficients: rightCoefficients, upperBound: Math.max(...rightCoefficients) * scale }
		if (leftInterval.upperBound > result.density) intervals.push(leftInterval)
		if (rightInterval.upperBound > result.density) intervals.push(rightInterval)
	}
	return result
}
