const { numberArray } = require('../util/arrays')

const { getOrder } = require('./evaluation')

// normalizeCoef ensures that the sum of the coefficients equals one. It returns a copy (or itself if the sum is already one).
function normalizeCoef(coef) {
	const sum = coef.reduce((sum, c) => sum + c, 0)
	return Math.abs(sum - 1) < 1e-15 ? coef : coef.map(c => c / sum)
}
module.exports.normalizeCoef = normalizeCoef

// updateCoef updates the coefficients, given that a problem has been solved correctly or incorrectly.
function updateCoef(coef, correct = false) {
	const n = getOrder(coef)
	if (correct)
		return normalizeCoef(numberArray(0, n + 1).map(i => (i === 0 ? 0 : coef[i - 1] * i / (n + 2))))
	return normalizeCoef(numberArray(0, n + 1).map(i => (i === n + 1 ? 0 : coef[i] * (n + 1 - i) / (n + 2))))
}
module.exports.updateCoef = updateCoef