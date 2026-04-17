const { ensureInt, sum, factorial } = require('@step-wise/utils')

const { ensureCoefficients, getOrder } = require('./fundamentals')

// getExpectedValue returns the expected value of x, given the coefficients of its distribution. Effectively it is "int_0^1 x*f(x) dx".
function getExpectedValue(coef) {
	return getMoment(coef, 1)
}
module.exports.getExpectedValue = getExpectedValue

// getMoment returns the expected value of x^i, given the PDF fx(x) and an integer i. Effectively it is "int_0^1 x^i*f(x) dx".
function getMoment(coef, i) {
	// Check input.
	coef = ensureCoefficients(coef)
	i = ensureInt(i, true)

	// Calculate the moment.
	const n = getOrder(coef)
	return sum(coef.map((c, j) => c * factorial(i + j, j), 0)) / factorial(n + i + 1, n + 1)
}
module.exports.getMoment = getMoment

// getVariance returns the variance of x.
function getVariance(coef) {
	const EV = getExpectedValue(coef)
	return getMoment(coef, 2) - EV ** 2
}
module.exports.getVariance = getVariance
