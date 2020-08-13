const { numberArray } = require('../util/arrays')
const { binomial } = require('../util/combinatorics')
const { isInt, isNumber, boundTo } = require('../util/numbers')
const { processOptions } = require('../util/objects')

const { getOrder, ensureCoef } = require('./evaluation')
const { normalizeCoef } = require('./updating')

// Define various settings.
const decayHalfLife = 365.25 * 24 * 60 * 60 * 1000 // [Milliseconds] The time after which half of the convergence towards the flat distribution is obtained.
const initialPracticeDecayTime = 3 * 30 * 24 * 60 * 60 * 1000 // [Milliseconds] The equivalent time of decay for practicing a problem.
const practiceDecayHalfLife = 8 // [Problems practiced] The number of problems practiced until the practice decay halves.
const maxSmoothingOrder = 120 // The maximum order for smoothing. This needs a cap, for numerical reasons. For higher values the binomials start failing.
const defaultSmoothingOptions = {
	time: 0,
	applyPracticeDecay: false,
	numProblemsPracticed: 0,
}

// smoothenCoef smoothens the distribution described by the coefficients. The new order (and hence how much smoothing is done) is also given. If the smoothing order is too high, no smoothing is done.
function smoothenCoef(coef, factor) {
	// Check input.
	coef = ensureCoef(coef)
	if (!isNumber(factor) || factor < 0 || factor > 1)
		throw new Error(`Invalid input: the smoothenCoef factor must be a number between 0 and 1 (inclusive) but received "${factor}".`)

	// Check border cases.
	if (factor === 0)
		return coef
	if (factor === 1)
		return [1]

	// Calculate smoothing orders.
	const orders = []
	while (true) {
		const nNew = Math.ceil(2*factor/(1 - factor))
		if (nNew > maxSmoothingOrder)
			break
		orders.push(nNew)
		factor/= nNew/(nNew + 2)
	}

	// Apply smoothing. Do this in multiple steps, to approximate the factor as closely as possible. Do it in reverse order, ending with the smallest order, to make sure we store as few coefficients as possible.
	orders.reverse().forEach(nNew => {
		coef = smoothenCoefWithOrder(coef, nNew)
	})
	return coef
}
module.exports.smoothenCoef = smoothenCoef

// smoothenCoefWithOrder smoothens the distribution described by the coefficients, using a smoothing order. If the smoothing order is too high, no smoothing is done.
function smoothenCoefWithOrder(coef, nNew) {
	// Check input.
	if (!isInt(nNew) || nNew < 0)
		throw new Error(`Invalid input: the smoothenCoef function requires nNew to be a non-negative integer but received "${nNew}".`)

	// Check border case.
	if (nNew >= maxSmoothingOrder)
		return coef

	// Calculate.
	const nOld = getOrder(coef)
	return normalizeCoef(numberArray(0, nNew).map(i => coef.reduce((sum, c, j) => sum + c * binomial(i + j, i) * binomial(nNew + nOld - i - j, nOld - j), 0)))
}
module.exports.smoothenCoef = smoothenCoef

/* getSmoothingFactor gives the order appropriate for smoothing. It calculates this on the given options:
 * - time (default 0): how much time (in milliseconds) has passed since the last exercise?
 * - applyPracticeDecay (default false): should we add in practice decay?
 * - numProblemsPracticed (default 0): how many times has the user practiced this skill before? How many problems have been done?
 */
function getSmoothingFactor(options) {
	const { time, applyPracticeDecay, numProblemsPracticed } = processOptions(options, defaultSmoothingOptions)

	// Calculate the equivalent time for smoothing.
	const practiceDecayTime = applyPracticeDecay ? initialPracticeDecayTime * Math.pow(1 / 2, numProblemsPracticed / practiceDecayHalfLife) : 0
	const equivalentTime = time + practiceDecayTime

	// Boundary check.
	if (equivalentTime === 0)
		return maxSmoothingOrder

	// Calculate smoothing factor.
	return Math.pow(1 / 2, equivalentTime / decayHalfLife)
}
module.exports.getSmoothingFactor = getSmoothingFactor