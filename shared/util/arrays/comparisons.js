const { compareNumbers } = require('../numbers')
const { deepEquals } = require('../objects')

// areArraysEqualShallow checks if two arrays are equal in the sense that all its elements satisfy a === comparison.
function areArraysEqualShallow(arr1, arr2) {
	return arr1.length === arr2.length && arr1.every((element, index) => element === arr2[index])
}
module.exports.areArraysEqualShallow = areArraysEqualShallow

// compareNumberArrays checks whether two number arrays have the same values, barring numerical differences.
function compareNumberArrays(arr1, arr2) {
	return arr1.length === arr2.length && arr1.every((value, index) => (Array.isArray(value) ? compareNumberArrays : compareNumbers)(value, arr2[index]))
}
module.exports.compareNumberArrays = compareNumberArrays

// hasSimpleMatching checks if every element of one array can be matched with an element from the other array, where the given matching function decides if a matching is allowed. Only a simple matching is performed: we assume transitivity on the matching function. In other words, if A matches B and B matches C, then also A matches C.
function hasSimpleMatching(arr1, arr2, matching = deepEquals) {
	if (!Array.isArray(arr1) || !Array.isArray(arr2))
		return false
	if (arr1.length !== arr2.length)
		return false
	const matched = arr1.map(() => false)
	return arr1.every(element => { // For every element, find a matching partner.
		const index = arr2.findIndex((otherElement, index) => {
			return !matched[index] && matching(element, otherElement)
		}) // Is there a partner that has not been matched yet?
		if (index === -1)
			return false // No match found. Abort.
		matched[index] = true // Remember that this element from the second array has been matched.
		return true // Match found. Continue.
	})
}
module.exports.hasSimpleMatching = hasSimpleMatching
