const { isNumber } = require('../util/numbers')
const { numberArray } = require('../util/arrays')
const { binomial } = require('../util/combinatorics')

// getOrder returns the order of the coefficient array, which is its length minus one.
function getOrder(coef) {
	return coef.length - 1
}
module.exports.getOrder = getOrder

// ensureCoef takes a coef array and ensures it actually is one.
function ensureCoef(coef) {
	// Check that it's an array of numbers.
	if (!Array.isArray(coef))
		throw new Error(`Invalid input: expect a coefficient array but received an object of type "${coef}".`)
	if (coef.some(v => !isNumber(v)))
		throw new Error(`Invalid input: expect a coefficient array with numbers but not all entries are numbers.`)

	// Check that the sum equals one.
	const sum = coef.reduce((sum, v) => sum + v, 0)
	if (Math.abs(sum - 1) > 1e-12)
		throw new Error(`Invalid input: expect a coefficient array whose sum equals one, but the sum instead is ${sum}. The array itself is [${coef.join(', ')}].`)
	return coef
}
module.exports.ensureCoef = ensureCoef

// getFunction gives the PDF for the chance of success, given the coefficients.
function getFunction(coef) {
	const n = getOrder(coef)
	return x => {
		// Check input.
		if (!isNumber(x))
			throw new Error(`Invalid input: cannot evaluate the skill function for x="${x}". A number is required.`)
		x = parseFloat(x)
		if (x < 0 || x > 1)
			throw new Error(`Invalid input: cannot evaluate the skill function for x=${x}. A number between 0 and 1 (inclusive) is required.`)

		// Calculate.
		return coef.reduce((sum, c, i) => sum + c * binomial(n, i) * Math.pow(x, i) * Math.pow(1 - x, n - i), 0) * (n + 1)
	}
}
module.exports.getFunction = getFunction

// getFunctionDerivative gives the derivative of the PDF.
function getFunctionDerivative(coef) {
	const n = getOrder(coef)
	return x => {
		// Check input.
		if (!isNumber(x))
			throw new Error(`Invalid input: cannot evaluate the skill function for x="${x}". A number is required.`)
		x = parseFloat(x)
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
module.exports.getFunction = getFunction

function getEV(coef) {
	const n = getOrder(coef)
	return coef.reduce((sum, c, i) => sum + c * (i + 1), 0) / (n + 2)
}
module.exports.getEV = getEV

// getFMax returns the maximum value of the PDF function. It returns an object {x, f} with x the input and f the output. It's the result of a binary search, so results are not fully exact.
function getFMax(coef, numIterations = 20) {
	// Perform a binary search on the gradient.
	let left = 0, right = 1
	const f = getFunction(coef)
	const fDerivative = getFunctionDerivative(coef)
	for (let i = 0; i < numIterations; i++) {
		const middle = (left + right)/2
		const derivative = fDerivative(middle)
		if (derivative > 0)
			left = middle
		else if (derivative < 0)
			right = middle
		else
			break
	}
	const middle = (left + right)/2
	return { x: middle, f: f(middle) }
}
module.exports.getFMax = getFMax

// getEntropy estimates numerically the entropy of the distribution. It's the expected value of log(fx(x)).
function getEntropy(coef, numPoints = 50) {
	const f = getFunction(coef)
	const points = numberArray(0, numPoints-1).map(v => (v + 0.5)/numPoints)
	return points.reduce((sum, x) => {
		const fx = f(x)
		return sum + Math.log(fx)*fx
	}, 0)/numPoints
}
module.exports.getEntropy = getEntropy

function getData(coef) {
	return {
		c: coef,
		f: getFunction(coef),
		EV: getEV(coef),
	}
}
module.exports.getData = getData