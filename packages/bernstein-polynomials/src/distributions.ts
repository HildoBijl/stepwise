import { ensureInteger, sum, cumulative } from '@step-wise/utils'
import { binomial } from '@step-wise/math-tools'

import { BernsteinCoefficients } from './types'
import { getBernsteinOrder } from './fundamentals'

// Evaluate the Bernstein Polynomial for a set of coefficients and a given x.
function evaluateBernsteinPolynomial(coefficients: BernsteinCoefficients, x: number): number {
	const n = getBernsteinOrder(coefficients)
	return sum(coefficients.map((c, i) => c * binomial(n, i) * x ** i * (1 - x) ** (n - i)))
}

// Get the PDF for the chance of success, given the coefficients.
export function getBernsteinPDF(coefficients: BernsteinCoefficients): (x: number) => number {
	return x => {
		if (x < 0 || x > 1) return 0
		return evaluateBernsteinPolynomial(coefficients, x) * (getBernsteinOrder(coefficients) + 1)
	}
}

// Get the derivative of the PDF.
export function getBernsteinPDFDerivative(coefficients: BernsteinCoefficients): (x: number) => number {
	const n = getBernsteinOrder(coefficients)
	return x => {
		if (x < 0 || x > 1) return 0
		return sum(coefficients.map((c, i) => {
			if (i === 0) return c * binomial(n, i) * (-n * (1 - x) ** (n - 1))
			if (i === n) return c * binomial(n, i) * (n * x ** (n - 1))
			return c * binomial(n, i) * (i - n * x) * x ** (i - 1) * (1 - x) ** (n - i - 1)
		})) * (n + 1)
	}
}

// Get the CDF corresponding to the PDF with the given coefficients.
export function getBernsteinCDF(coefficients: BernsteinCoefficients): (x: number) => number {
	const cdfCoef = getBernsteinCDFCoefficients(coefficients)
	return x => {
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
	const ensuredNumIterations = ensureInteger(numIterations, true, true)
	const cdf = getBernsteinCDF(coefficients)

	return F => {
		if (F < 0 || F > 1) throw new Error(`Invalid inverse CDF input: received a number that is not a possible CDF output. The number must be between 0 and 1 (inclusive) but ${F} was given.`)
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

// Get the maximum value of the PDF. Returns { x, f } with x the input and f the output.
export function getBernsteinPDFMaximum(coefficients: BernsteinCoefficients, numIterations = 20): { x: number, f: number } {
	const ensuredNumIterations = ensureInteger(numIterations, true, true)

	let left = 0, right = 1
	const pdf = getBernsteinPDF(coefficients)
	const pdfDerivative = getBernsteinPDFDerivative(coefficients)

	for (let i = 0; i < ensuredNumIterations; i++) {
		const middle = (left + right) / 2
		const derivative = pdfDerivative(middle)
		if (derivative > 0) left = middle
		else if (derivative < 0) right = middle
		else break
	}

	const middle = (left + right) / 2
	return { x: middle, f: pdf(middle) }
}
