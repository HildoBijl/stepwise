// lastOf takes an array and returns its last item. It does not adjust the array.
function lastOf(array) {
	return array[array.length - 1]
}

// findOptimumIndex takes an array of objects, like [{x: 3}, {x: 2}, {x: 5}]. It also takes a comparison function (a, b) => [bool], indicating whether a is better than b. For example, to find the object with the highest x, use "(a, b) => x.a > x.b". It then returns the index of the object with the optimal value. Returns -1 on an empty array.
function findOptimumIndex(arr, isBetter) {
	return arr.reduce((bestIndex, element, index) => bestIndex === -1 || isBetter(element, arr[bestIndex]) ? index : bestIndex, -1)
}

// findOptimum works identically to findOptimumIndex but returns the optimal object itself. Returns undefined on an empty array.
function findOptimum(arr, isBetter) {
	return arr[findOptimumIndex(arr, isBetter)]
}

// numberArray creates an array with numbers from min (inclusive) to max (inclusive). If only one parameter is given, min is assumed to be 0 and the number is used as max.
function numberArray(p1, p2) {
	let min, max
	if (p2 === undefined) {
		min = 0
		max = p1
	} else {
		min = p1
		max = p2
	}
	return [...Array(max - min + 1).keys()].map(x => x + min)
}

module.exports = {
	lastOf,
	findOptimumIndex,
	findOptimum,
	numberArray,
}