const { ensureArray, ensureNumberArray, sum } = require('../../util/arrays')
const { isBasicObject } = require('../../util/objects')

// ensureCoef takes a coef array and ensures it actually is one: it is an array of non-negative numbers whose sum equals one. It returns a copy of the array.
function ensureCoef(coef) {
	coef = ensureNumberArray(coef, true)
	if (Math.abs(sum(coef) - 1) > 1e-12)
		throw new Error(`Invalid input: expect a coefficient array whose sum equals one, but the sum instead is ${sum}. The array itself is [${coef.join(', ')}].`)
	return coef
}
module.exports.ensureCoef = ensureCoef

// getOrder returns the order of the coefficient array, which is its length minus one.
function getOrder(coef) {
	return ensureArray(coef).length - 1
}
module.exports.getOrder = getOrder

// normalize ensures that the sum of the coefficients equals one. It also prevents negative coefficients, which should not happen in the first place, but might occur due to numerical reasons. It returns a copy (or itself if the sum is already one). It is only used internally.
function normalize(coef) {
	coef = ensureNumberArray(coef, true)
	coef = coef.map(c => Math.max(c, 0)) // Set negative coefficients to zero.
	const coefSum = sum(coef)
	return Math.abs(coefSum - 1) < 1e-15 ? coef : coef.map(c => c / coefSum)
}
module.exports.normalize = normalize

// invert flips the coefficients. Basically, if the coefficients describe the PDF of x, then the inverted coefficient describes the PDF of 1 - x, also known as "not x".
function invert(coef) {
	return [...coef].reverse()
}
module.exports.invert = invert

// ensureDataSet checks whether the given object is a data set object. The check is not in-depth: it just confirms it's a basic object.
function ensureDataSet(dataSet) {
	if (!isBasicObject(dataSet))
		throw new Error(`Invalid data set: expected the data parameter to be a basic object but received something of type "${dataSet}".`)
	return dataSet
}
module.exports.ensureDataSet = ensureDataSet

// getCoefFromDataSet gets a coefficient array from a data set based on the ID. It throws an error if the ID is not known.
function getCoefFromDataSet(dataSet, id) {
	// Check input.
	dataSet = ensureDataSet(dataSet)
	if (!dataSet[id])
		throw new Error(`Invalid skill ID: the skill ID "${id}" did not exist in the given skill data set.`)

	// Check coefficients.
	return ensureCoef(dataSet[id])
}
module.exports.getCoefFromDataSet = getCoefFromDataSet
