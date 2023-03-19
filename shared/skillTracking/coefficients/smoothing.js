const { ensureInt, ensureNumber } = require('../../util/numbers')
const { processOptions } = require('../../util/objects')
const { sum } = require('../../util/arrays')
const { repeat } = require('../../util/functions')
const { binomial } = require('../../util/combinatorics')

const { maxOrder, maxSmoothingOrder, decayHalfLife, initialPracticeDecayTime, practiceDecayHalfLife } = require('../settings')

const { getOrder, ensureCoef, normalize } = require('./fundamentals')

const defaultSmoothingOptions = {
	time: 0,
	applyPracticeDecay: false,
	numProblemsPracticed: 0,
	decayHalfLife,
	initialPracticeDecayTime,
	practiceDecayHalfLife,
}

// smoothen takes a set of smoothing options, determines its own smoothing factor, and applies smoothing with that factor.
function smoothen(coefficients, options) {
	const factor = getSmoothingFactor(options)
	return smoothenWithFactor(coefficients, factor)
}
module.exports.smoothen = smoothen

/* getSmoothingFactor gives the order appropriate for smoothing. It is purely a heuristic thing. It calculates its result based on the given options:
 * - time (default 0): how much time (in milliseconds) has passed since the last exercise?
 * - applyPracticeDecay (default false): should we add in practice decay?
 * - numProblemsPracticed (default 0): how many times has the user practiced this skill before? How many problems have been done?
 */
function getSmoothingFactor(options) {
	const { time, applyPracticeDecay, numProblemsPracticed, initialPracticeDecayTime, practiceDecayHalfLife } = processOptions(options, defaultSmoothingOptions)

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

// smoothenWithFactor smoothens the distribution described by the coefficients with a given factor. A factor of 1 leaves the distribution unchanged, while 0 brings it back to the starting distribution. Effectively, the new mean is (0.5 * (mu_old - 0.5) * factor). If the factor is too close to one, then no smoothing is done, unless the coefficient array is too large, which may cause numerical problems.
function smoothenWithFactor(coef, factor) {
	// Check input.
	coef = ensureCoef(coef)
	factor = ensureNumber(factor)
	if (factor < 0 || factor > 1)
		throw new Error(`Invalid input: the smoothen factor must be a number between 0 and 1 (inclusive) but received "${factor}".`)

	// Check boundary cases.
	if (factor === 0 || coef.length <= 1)
		return [1]
	if (factor === 1)
		return coef

	// Calculate smoothing orders.
	const orders = []
	while (true) {
		const nNew = Math.ceil(2 * factor / (1 - factor) - 1e-15) // The 1e-15 is a compensation for numerical issues.
		if (nNew > maxSmoothingOrder)
			break
		orders.push(nNew)
		factor /= nNew / (nNew + 2)
	}

	// If the coefficient array is too large, smoothen regardless of the factor.
	if (orders.length === 0 && getOrder(coef) > maxOrder)
		orders.push(maxSmoothingOrder)

	// Apply smoothing. Do this in multiple steps, to approximate the factor as closely as possible. Do it in reverse order, ending with the smallest order, to make sure we return/store as few coefficients as possible.
	orders.reverse().forEach(nNew => {
		coef = smoothenWithOrder(coef, nNew)
	})
	return coef
}
module.exports.smoothenWithFactor = smoothenWithFactor

// smoothenWithOrder smoothens the distribution described by the coefficients, using a smoothing order. If the smoothing order is too high, no smoothing is done.
function smoothenWithOrder(coef, newOrder) {
	// Check input.
	newOrder = ensureInt(newOrder, true)

	// Check boundary cases.
	if (coef.length <= 1)
		return [1]
	if (newOrder > maxSmoothingOrder)
		return coef

	// Calculate the new coefficients.
	const oldOrder = getOrder(coef)
	return normalize(repeat(newOrder + 1, i => sum(coef.map((c, j) => c * binomial(i + j, i) * binomial(newOrder + oldOrder - i - j, oldOrder - j)))))
}
module.exports.smoothenWithOrder = smoothenWithOrder
