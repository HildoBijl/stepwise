const { ensureInt, ensureNumber } = require('../../util/numbers')
const { sum, getCumulativeArray } = require('../../util/arrays')
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
			return 0

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
			return 0

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

// getCDF returns the CDF corresponding to the PDF with the given coefficients. The result is a function.
function getCDF(coef) {
	const CDFcoef = getCDFCoefficients(coef)
	const n = getOrder(CDFcoef)
	return x => {
		x = ensureNumber(x)
		if (x < 0)
			return 0
		if (x > 1)
			return 1
		return sum(CDFcoef.map((c, i) => c * binomial(n, i) * Math.pow(x, i) * Math.pow(1 - x, n - i))) * (n + 1)
	}
}
module.exports.getCDF = getCDF

// getCDFCoefficients takes a set of coefficients for a PDF, and returns the coefficients for the CDF. After all, the CDF of a PDF that is the sum of beta distributions is once more a sum of beta distributions (but not normalized).
function getCDFCoefficients(coef) {
	const n = getOrder(coef)
	return getCumulativeArray([0, ...coef]).map(x => x / (n + 2)) // Get the cumulative array of coefficients, and divide by n + 2.
}
module.exports.getCDFCoefficients = getCDFCoefficients

// getInverseCDF takes a set of coefficients an returns the inverse CDF. The inverse CDF uses the CDF and runs a binary search on it on every call to get the inverse.
function getInverseCDF(coef, numIterations = 20) {
	const cdf = getCDF(coef)
	return F => {
		// Check edge cases.
		F = ensureNumber(F)
		if (F < 0 || F > 1)
			throw new Error(`Invalid inverse CDF input: received a number that is not a possible CDF output. The number must be between 0 and 1 (inclusive) but ${F} was given.`)
		if (F === 0)
			return 0
		if (F === 1)
			return 1

		// Run a binary search.
		let left = 0, right = 1
		for (let i = 0; i < numIterations; i++) {
			const middle = (left + right) / 2
			const cdfValue = cdf(middle)
			if (cdfValue < F)
				left = middle
			else if (cdfValue > F)
				right = middle
			else
				break
		}
		return (left + right) / 2
	}
}
module.exports.getInverseCDF = getInverseCDF

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
