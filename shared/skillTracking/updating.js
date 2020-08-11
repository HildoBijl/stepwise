const { numberArray } = require('../util/arrays')
const { binomial } = require('../util/combinatorics')
const { isInt } = require('../util/numbers')

const { getOrder } = require('./evaluation')

function normalizeCoef(coef) {
	const sum = coef.reduce((sum, c) => sum + c, 0)
	return Math.abs(sum - 1) < 1e-15 ? coef : coef.map(c => c / sum)
}
module.exports.normalizeCoef = normalizeCoef

function updateCoef(coef, correct = false) {
	const n = getOrder(coef)
	if (correct)
		return normalizeCoef(numberArray(0, n + 1).map(i => (i === 0 ? 0 : coef[i - 1] * i / (n + 2))))
	return normalizeCoef(numberArray(0, n + 1).map(i => (i === n + 1 ? 0 : coef[i] * (n + 1 - i) / (n + 2))))
}
module.exports.updateCoef = updateCoef

function smoothenCoef(coef, nNew) {
	// Check input.
	if (!isInt(nNew) || nNew < 0)
		throw Error(`Invalid input: the smoothenCoef function requires nNew to be a non-negative integer but received "${nNew}".`)
	
	// Calculate.
	const nOld = getOrder(coef)
	return normalizeCoef(numberArray(0, nNew).map(i => coef.reduce((sum, c, j) => sum + c * binomial(i+j, i) * binomial(nNew + nOld - i - j, nOld - j), 0)))
}
module.exports.smoothenCoef = smoothenCoef