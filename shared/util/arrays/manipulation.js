// arraySplice takes an array, removes at index "index" a number of "numItemsToRemove" items and in their places splices in the given elements. It does NOT adjust the initial array but returns a copy of the result. (No deep copy is made.)
function arraySplice(initialArray, index, numItemsToRemove = 0, ...insertItems) {
	const result = [...initialArray]
	result.splice(index, numItemsToRemove, ...insertItems)
	return result
}
module.exports.arraySplice = arraySplice

// filterDuplicates removes all duplicates from an array. Optionally, an equals function can be specified.
function filterDuplicates(array, equals = (a, b) => a === b) {
	return array.filter((value, index) => !array.some((otherValue, otherIndex) => otherIndex < index && equals(value, otherValue)))
}
module.exports.filterDuplicates = filterDuplicates

// fillUndefinedWith takes an array and fills all undefined values with the given value. It changes the array and returns itself.
function fillUndefinedWith(array, filler) {
	for (let i = 0; i < array.length; i++) {
		if (array[i] === undefined)
			array[i] = filler
	}
	return array
}
module.exports.fillUndefinedWith = fillUndefinedWith
