const { ensureArray, ensureNumberArray } = require('../util/arrays')

// normalize ensures that the sum of the coefficients equals one. It returns a copy (or itself if the sum is already one). It is only used internally.
function normalize(coef) {
	const sum = coef.reduce((sum, c) => sum + c, 0)
	return Math.abs(sum - 1) < 1e-15 ? coef : coef.map(c => c / sum)
}
module.exports.normalize = normalize

// invert flips the coefficients. Basically, if the coefficients describe the PDF of x, then the inverted coefficient describes the PDF of 1 - x, also known as "not x".
function invert(coef) {
	return [...coef].reverse()
}
module.exports.invert = invert