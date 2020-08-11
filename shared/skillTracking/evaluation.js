const { isNumber } = require('../util/numbers')
const { binomial } = require('../util/combinatorics')

function getOrder(coef) {
	return coef.length - 1
}
module.exports.getOrder = getOrder

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

function getEV(coef) {
	const n = getOrder(coef)
	return coef.reduce((sum, c, i) => sum + c * (i + 1), 0) / (n + 2)
}
module.exports.getEV = getEV

function getData(coef) {
	return {
		c: coef,
		f: getFunction(coef),
		EV: getEV(coef),
	}
}
module.exports.getData = getData