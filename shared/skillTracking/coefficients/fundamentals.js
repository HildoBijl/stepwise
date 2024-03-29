const { ensureArray, ensureNumberArray, sum, isBasicObject, keysToObject } = require('../../util')

// ensureCoef takes a coef array and ensures it actually is one: it is an array of non-negative numbers whose sum equals one. It returns a copy of the array.
function ensureCoef(coef, requireNormalized = true) {
	coef = ensureNumberArray(coef, true)
	if (requireNormalized && Math.abs(sum(coef) - 1) > 1e-12)
		throw new Error(`Invalid input: expected a coefficient array whose sum equals one, but the sum instead is ${sum}. The array itself is [${coef.join(', ')}].`)
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

// ensureCoefSet checks whether the given object is a coefficient set object. If a list of required skill IDs is given, it filters the skills to the given IDs and checks only these.
function ensureCoefSet(coefSet, requiredSkillIds) {
	if (!isBasicObject(coefSet))
		throw new Error(`Invalid coefficient set: expected the coefficient set parameter to be a basic object but received something of type "${typeof coefSet}".`)
	if (!requiredSkillIds)
		requiredSkillIds = Object.keys(coefSet)
	if (requiredSkillIds)
		coefSet = keysToObject(requiredSkillIds, skillId => getCoef(coefSet, skillId))
	return coefSet
}
module.exports.ensureCoefSet = ensureCoefSet

// getCoef gets a coefficient array from a coefficient set based on the ID. It throws an error if the ID is not known.
function getCoef(coefSet, skillId) {
	if (!coefSet[skillId])
		throw new Error(`Invalid skill ID: the skill ID "${skillId}" did not exist in the given coefficient set.`)
	return ensureCoef(coefSet[skillId])
}
module.exports.getCoef = getCoef
