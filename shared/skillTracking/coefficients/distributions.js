const { ensureInt, ensureNumber } = require('../../util/numbers')
const { sum } = require('../../util/arrays')
const { binomial } = require('../../util/combinatorics')

const { ensureCoef, getOrder } = require('./fundamentals')

// getPDF gives the PDF for the chance of success, given the coefficients.
function getPDF(coef) {
	// Process input.
	coef = ensureCoef(coef)
	const n = getOrder(coef)

	// Set up the probability density function.
	return x => {
		// Check input.
		x = ensureNumber(x)
		if (x < 0 || x > 1)
			throw new Error(`Invalid input: cannot evaluate the probability density function for x=${x}. A number between 0 and 1 (inclusive) is required.`)

		// Calculate.
		return sum(coef.map((c, i) => c * binomial(n, i) * Math.pow(x, i) * Math.pow(1 - x, n - i))) * (n + 1)
	}
}
module.exports.getPDF = getPDF

// getPDFDerivative gives the derivative of the PDF.
function getPDFDerivative(coef) {
	// Process input.
	coef = ensureCoef(coef)
	const n = getOrder(coef)

	// Set up the probability density function derivative.
	return x => {
		// Check input.
		x = ensureNumber(x)
		if (x < 0 || x > 1)
			throw new Error(`Invalid input: cannot evaluate the probability density function derivative for x=${x}. A number between 0 and 1 (inclusive) is required.`)

		// Calculate.
		return sum(coef.map((c, i) => {
			if (i === 0)
				return c * binomial(n, i) * (-n * Math.pow(1 - x, n - 1))
			if (i === n)
				return c * binomial(n, i) * (n * Math.pow(x, n - 1))
			return c * binomial(n, i) * (i - n * x) * Math.pow(x, i - 1) * Math.pow(1 - x, n - i - 1)
		})) * (n + 1)
	}
}
module.exports.getPDFDerivative = getPDFDerivative

// getMaxLikelihood returns the maximum value of the PDF function. It returns an object {x, f} with x the input and f the output. It's the result of a binary search, so results are not fully exact.
function getMaxLikelihood(coef, numIterations = 20) {
	// Check input.
	coef = ensureCoef(coef)
	numIterations = ensureInt(numIterations, true, true)

	// Perform a binary search on the gradient.
	let left = 0, right = 1
	const pdf = getPDF(coef)
	const pdfDerivative = getPDFDerivative(coef)
	for (let i = 0; i < numIterations; i++) {
		const middle = (left + right) / 2
		const derivative = pdfDerivative(middle)
		if (derivative > 0)
			left = middle
		else if (derivative < 0)
			right = middle
		else
			break
	}
	const middle = (left + right) / 2
	return { x: middle, f: pdf(middle) }
}
module.exports.getMaxLikelihood = getMaxLikelihood
