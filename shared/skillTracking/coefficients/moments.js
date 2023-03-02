const { ensureInt } = require('../../util/numbers')
const { sum } = require('../../util/arrays')
const { factorial } = require('../../util/combinatorics')

const { ensureCoef, getOrder } = require('./fundamentals')

// getEV returns the expected value of x, given the coefficients of its distribution. Effectively it is "int_0^1 x*f(x) dx".
function getEV(coef) {
	return getMoment(coef, 1)
}
module.exports.getEV = getEV

// getMoment returns the expected value of x^i, given the PDF fx(x) and an integer i. Effectively it is "int_0^1 x^i*f(x) dx".
function getMoment(coef, i) {
	// Check input.
	coef = ensureCoef(coef)
	i = ensureInt(i, true)

	// Calculate the moment.
	const n = getOrder(coef)
	return sum(coef.map((c, j) => c * factorial(i + j, j), 0)) / factorial(n + i + 1, n + 1)
}
module.exports.getMoment = getMoment

// getVariance returns the variance of x.
function getVariance(coef) {
	const EV = getEV(coef)
	return getMoment(coef, 2) - EV ** 2
}
module.exports.getVariance = getVariance