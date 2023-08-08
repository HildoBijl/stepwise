const { product, repeat, binomial } = require('../../util')

const { getOrder, normalize } = require('./fundamentals')

// mergeTwo takes two sets of coefficients and merges them, coming up with a joint distribution.
function mergeTwo(coef1, coef2) {
	// Get orders for easy notation.
	const n1 = getOrder(coef1)
	const n2 = getOrder(coef2)
	const n = n1 + n2

	// Calculate multiplication coefficients.
	const arr1 = coef1.map((c, i) => c * binomial(n1, i))
	const arr2 = coef2.map((c, i) => c * binomial(n2, i))

	// Sum up the corresponding multiplication coefficients.
	let coef = new Array(n + 1).fill(0)
	arr1.forEach((v1, i) => {
		arr2.forEach((v2, j) => {
			coef[i + j] += v1 * v2
		})
	})

	// Ensure that the coefficients match the desired format.
	coef = coef.map((v, i) => v / binomial(n, i))
	return normalize(coef)
}
module.exports.mergeTwo = mergeTwo

// merge takes a list of coefficient arrays and merges them all.
function merge(coefs) {
	// Check boundary cases.
	if (coefs.length === 0)
		return [1]
	if (coefs.length === 1)
		return coefs[0]

	// Merge them one by one.
	return coefs.reduce((result, coef, index) => (index === 0 ? coef : mergeTwo(result, coef)))
}
module.exports.merge = merge

// mergeElementwise takes a set of coefficients and multiplies all coefficients element-wise. The coefficient arrays must have the same length.
function mergeElementwise(coefs) {
	// Check input.
	if (coefs.some(coef => coef.length !== coefs[0].length))
		throw new Error(`Invalid coefficient list: when merging coefficient lists element-wise, all coefficient lists must have the same number of coefficients. This was not the case.`)

	// Merge all lists by taking the element-wise product of the coefficients.
	const numCoefficients = coefs[0].length
	return normalize(repeat(numCoefficients, index => product(coefs.map(coef => coef[index]))))
}
module.exports.mergeElementwise = mergeElementwise
