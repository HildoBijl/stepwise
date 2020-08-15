const { ensureNumber } = require('./numbers')

// ensureArray checks whether a variable is an array and throws an error if not. If all is fine, the same parameter is returned.
function ensureArray(array) {
	if (!Array.isArray(array))
		throw new Error(`Input error: expected an array but received an object of type "${typeof array}".`)
	return array
}
module.exports.ensureArray = ensureArray

// ensureNumberArray checks whether a variable is an array filled with numbers. It can be given the same extra options as ensureNumber.
function ensureNumberArray(array, positive, nonzero) {
	array = ensureArray(array)
	array = array.map(v => ensureNumber(v, positive, nonzero))
	return array
}
module.exports.ensureNumberArray = ensureNumberArray

// lastOf takes an array and returns its last item. It does not adjust the array.
function lastOf(array) {
	return array[array.length - 1]
}
module.exports.lastOf = lastOf

// findOptimumIndex takes an array of objects, like [{x: 3}, {x: 2}, {x: 5}]. It also takes a comparison function (a, b) => [bool], indicating whether a is better than b. For example, to find the object with the highest x, use "(a, b) => x.a > x.b". It then returns the index of the object with the optimal value. Returns -1 on an empty array.
function findOptimumIndex(arr, isBetter) {
	return arr.reduce((bestIndex, element, index) => bestIndex === -1 || isBetter(element, arr[bestIndex]) ? index : bestIndex, -1)
}
module.exports.findOptimumIndex = findOptimumIndex

// findOptimum works identically to findOptimumIndex but returns the optimal object itself. Returns undefined on an empty array.
function findOptimum(arr, isBetter) {
	return arr[findOptimumIndex(arr, isBetter)]
}
module.exports.findOptimum = findOptimum

// sum gives the sum of all array elements.
function sum(arr) {
	return arr.reduce((sum, v) => sum + v, 0)
}
module.exports.sum = sum

// numberArray creates an array with numbers from start (inclusive) to end (inclusive). So with 3 and 5 it's [3,4,5] and with 5 and 3 it's [5,4,3]. If only one parameter is given, then this is considered the end and the start is set to zero.
function numberArray(p1, p2) {
	let start, end
	if (p2 === undefined) {
		start = 0
		end = p1
	} else {
		start = p1
		end = p2
	}
	if (start <= end)
		return [...Array(end - start + 1).keys()].map(x => x + start)
	return [...Array(start - end + 1).keys()].map(x => start - x)
}
module.exports.numberArray = numberArray

// arraySplice takes an array, removes at index "index" a number of "numItemsToRemove" items and in their places splices in the given elements. It does NOT adjust the initial array but returns a copy of the result. (No deep copy is made.)
function arraySplice(initialArray, index, numItemsToRemove = 0, ...insertItems) {
	const result = [...initialArray]
	result.splice(index, numItemsToRemove, ...insertItems)
	return result
}
module.exports.arraySplice = arraySplice

// multiplyPolynomialCoefficients takes a polynomial of the form "a0 + a1*x + a2*x^2 + ..." and another of the form "b0 + b1*x + b2*x^2 + ...". Both polynomials are given in the form of arrays [a0, a1, ...] and [b0, b1, ...]. This function calculates the product (a0 + a1*x + a2*x^2 + ...) * (b0 + b1*x + b2*x^2 + ...) and returns the corresponding polynomial.
function multiplyPolynomialCoefficients(a, b) {
	// Check input.
	a = ensureNumberArray(a)
	b = ensureNumberArray(b)

	// Set up result.
	const result = new Array(a.length + b.length - 1).fill(0)
	a.forEach((v1, i) => {
		b.forEach((v2, j) => {
			result[i + j] += v1 * v2
		})
	})
	return result
}
module.exports.multiplyPolynomialCoefficients = multiplyPolynomialCoefficients