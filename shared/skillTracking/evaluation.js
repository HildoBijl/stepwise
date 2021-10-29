import { ensureInt, ensureNumber } from '../util/numbers'
import { ensureArray, ensureNumberArray, numberArray } from '../util/arrays'
import { factorial, binomial } from '../util/combinatorics'

// ensureCoef takes a coef array and ensures it actually is one. It returns a copy.
export function ensureCoef(coef) {
	// Check that it's an array of numbers.
	coef = ensureNumberArray(coef, true)

	// Check that the sum equals one.
	const sum = coef.reduce((sum, v) => sum + v, 0)
	if (Math.abs(sum - 1) > 1e-12)
		throw new Error(`Invalid input: expect a coefficient array whose sum equals one, but the sum instead is ${sum}. The array itself is [${coef.join(', ')}].`)

	// Return the processed array.
	return coef
}

// getOrder returns the order of the coefficient array, which is its length minus one.
export function getOrder(coef) {
	coef = ensureArray(coef)
	return coef.length - 1
}

// getFunction gives the PDF for the chance of success, given the coefficients.
export function getFunction(coef) {
	// Check input.
	coef = ensureCoef(coef)

	// Set up function.
	const n = getOrder(coef)
	return x => {
		// Check input.
		x = ensureNumber(x)
		if (x < 0 || x > 1)
			throw new Error(`Invalid input: cannot evaluate the skill function for x=${x}. A number between 0 and 1 (inclusive) is required.`)

		// Calculate.
		return coef.reduce((sum, c, i) => sum + c * binomial(n, i) * Math.pow(x, i) * Math.pow(1 - x, n - i), 0) * (n + 1)
	}
}

// getFunctionDerivative gives the derivative of the PDF.
export function getFunctionDerivative(coef) {
	// Check input.
	coef = ensureCoef(coef)

	// Set up derivative.
	const n = getOrder(coef)
	return x => {
		// Check input.
		x = ensureNumber(x)
		if (x < 0 || x > 1)
			throw new Error(`Invalid input: cannot evaluate the skill function for x=${x}. A number between 0 and 1 (inclusive) is required.`)

		// Calculate.
		return coef.reduce((sum, c, i) => {
			if (i === 0)
				return sum + c * binomial(n, i) * (-n * Math.pow(1 - x, n - 1))
			if (i === n)
				return sum + c * binomial(n, i) * (n * Math.pow(x, n - 1))
			return sum + c * binomial(n, i) * (i - n * x) * Math.pow(x, i - 1) * Math.pow(1 - x, n - i - 1)
		}, 0) * (n + 1)
	}
}

// getEV returns the expected value of x, given the PDF fx(x). So it's basically the integral over x*f(x).
export function getEV(coef) {
	return getMoment(coef, 1)
}

// getMoment returns the expected value of x^i, given the PDF fx(x) and an integer i. So it's basically the integral over x^i*f(x).
export function getMoment(coef, i) {
	// Check input.
	coef = ensureCoef(coef)
	i = ensureInt(i, true)

	// Calculate the moment.
	const n = getOrder(coef)
	return coef.reduce((sum, c, j) => sum + c * factorial(i+j, j), 0) / factorial(n + i + 1, n + 1)
}

// getFMax returns the maximum value of the PDF function. It returns an object {x, f} with x the input and f the output. It's the result of a binary search, so results are not fully exact.
export function getFMax(coef, numIterations = 20) {
	// Check input.
	coef = ensureCoef(coef)
	numIterations = ensureInt(numIterations, true, true)

	// Perform a binary search on the gradient.
	let left = 0, right = 1
	const f = getFunction(coef)
	const fDerivative = getFunctionDerivative(coef)
	for (let i = 0; i < numIterations; i++) {
		const middle = (left + right) / 2
		const derivative = fDerivative(middle)
		if (derivative > 0)
			left = middle
		else if (derivative < 0)
			right = middle
		else
			break
	}
	const middle = (left + right) / 2
	return { x: middle, f: f(middle) }
}

// getEntropy estimates numerically the entropy of the distribution. It's the expected value of log(fx(x)).
export function getEntropy(coef, numPoints = 50) {
	// Check input.
	coef = ensureCoef(coef)
	numPoints = ensureInt(numPoints, true, true)

	// Numerically calculate the entropy.
	const f = getFunction(coef)
	const points = numberArray(0, numPoints - 1).map(v => (v + 0.5) / numPoints) // Get points in the middles of the numPoints ranges.
	return points.reduce((sum, x) => {
		const fx = f(x)
		return sum + Math.log(fx) * fx
	}, 0) / numPoints
}
