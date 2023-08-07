// arrayFind is like Array.find or Array.findIndex but then instead of giving the element that returns true, it returns an object { index, element, value } where value is the first truthy value that was returned. If none are found, it returns undefined.
function arrayFind(array, func) {
	for (let index = 0; index < array.length; index++) {
		const element = array[index]
		const value = func(element, index, array)
		if (value)
			return { index, element, value }
	}
	return undefined
}
module.exports.arrayFind = arrayFind

// getIndexTrace will find an element in an array of subarrays. It returns an array of indices. So getIndexTrace([[2,3],[4,5,6],[7,[8,9]]], 8) will return [2,1,0] (third element, then second element, then first element). In case of duplicates, the first element is used. If nothing is found, undefined is returned.
function getIndexTrace(array, elementToFind) {
	const result = arrayFind(array, (element, index) => {
		if (element === elementToFind)
			return [index]
		if (Array.isArray(element)) {
			const result = getIndexTrace(element, elementToFind)
			return result && [index, ...result]
		}
		return false
	})
	return result && result.value
}
module.exports.getIndexTrace = getIndexTrace

// findOptimumIndex takes an array of objects, like [{x: 3}, {x: 2}, {x: 5}]. It also takes a comparison function (a, b) => [bool], indicating whether a is better than b. For example, to find the object with the highest x, use "(a, b) => x.a > x.b". It then returns the index of the object with the optimal value. Returns -1 on an empty array.
function findOptimumIndex(array, isBetter) {
	return array.reduce((bestIndex, element, index) => bestIndex === -1 || isBetter(element, array[bestIndex]) ? index : bestIndex, -1)
}
module.exports.findOptimumIndex = findOptimumIndex

// findOptimum works identically to findOptimumIndex but returns the optimal object itself. Returns undefined on an empty array.
function findOptimum(array, isBetter) {
	return array[findOptimumIndex(array, isBetter)]
}
module.exports.findOptimum = findOptimum
