const { ensureInt, ensureNumber } = require('./numbers')
const { deepEquals } = require('./objects')

// ensureArray checks whether a variable is an array and throws an error if not. If all is fine, the same parameter is returned.
function ensureArray(array) {
	if (!Array.isArray(array))
		throw new Error(`Input error: expected an array but received an object of type "${typeof array}".`)
	return array
}
module.exports.ensureArray = ensureArray

// ensureNumberArray checks whether a variable is an array filled with numbers. It can be given the same extra options as ensureNumber.
function ensureNumberArray(array, ...args) {
	array = ensureArray(array)
	array = array.map(v => ensureNumber(v, ...args))
	return array
}
module.exports.ensureNumberArray = ensureNumberArray

// lastOf takes an array and returns its last item. It does not adjust the array.
function lastOf(array) {
	return array[array.length - 1]
}
module.exports.lastOf = lastOf

// firstOf takes an array and returns its first item. Yes, you can do [0], but this may look prettier if you already use lastOf.
function firstOf(array) {
	return array[0]
}
module.exports.firstOf = firstOf

// secondLastOf returns the second-last element of an array.
function secondLastOf(array) {
	return array[array.length - 2]
}
module.exports.secondLastOf = secondLastOf

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

// sum gives the sum of all array elements.
function sum(array) {
	return array.reduce((sum, v) => sum + v, 0)
}
module.exports.sum = sum

// product gives the product of all array elements.
function product(array) {
	return array.reduce((product, v) => product * v, 1)
}
module.exports.product = product

// numberArray creates an array with numbers from start (inclusive) to end (inclusive). Both must be integers. So with 3 and 5 it's [3,4,5] and with 5 and 3 it's [5,4,3]. If only one parameter is given, then this is considered the end and the start is set to zero.
function numberArray(p1, p2) {
	p1 = ensureInt(p1)
	p2 = ensureInt(p2)
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

// getCumulativeArray takes a number array and returns a cumulative version of it.
function getCumulativeArray(array) {
	array = ensureNumberArray(array)
	let sum = 0
	return array.map(value => sum += value)
}
module.exports.getCumulativeArray = getCumulativeArray

// shuffle will shuffle the elements in an array. It returns a shallow copy, not affecting the original array. It uses the Fisher-Yates shuffle algorithm.
function shuffle(array) {
	array = [...array] // Clone array.
	for (let currIndex = array.length - 1; currIndex > 0; currIndex--) {
		const newPlace = Math.floor(Math.random() * (currIndex + 1))
		const temp = array[newPlace]
		array[newPlace] = array[currIndex]
		array[currIndex] = temp
	}
	return array
}
module.exports.shuffle = shuffle

// count takes an array and a function and checks for how many elements this function returns a truthy value.
function count(array, fun) {
	return array.reduce((sum, item) => sum + (fun(item) ? 1 : 0), 0)
}
module.exports.count = count

// hasDuplicates checks if an array has duplicates. Optionally, an equals function can be defined.
function hasDuplicates(array, equals = (a, b) => a === b) {
	const duplicate = array.find((x, index) => {
		return array.find((y, index2) => {
			return index < index2 && equals(x, y)
		})
	})
	return duplicate !== undefined
}
module.exports.hasDuplicates = hasDuplicates

// filterDuplicates removes all duplicates from an array. Optionally, an equals function can be specified.
function filterDuplicates(array, equals = (a, b) => a === b) {
	return array.filter((value, index) => !array.some((otherValue, otherIndex) => otherIndex < index && equals(value, otherValue)))
}
module.exports.filterDuplicates = filterDuplicates

// flattenFully flattens an array until it has no arrays left.
function flattenFully(array) {
	while (array.some(element => Array.isArray(element)))
		array = array.flat()
	return array
}
module.exports.flattenFully = flattenFully

// forceIntoShape takes a list and turns it into the shape given by the shape argument. If you provide a list [3, 5, 7, 9, 11] and a shape [[*, *], *, [*, [*]]], then the result will be [[3, 5], 7, [9, [11]]]. (The values of the shape do not matter.) You could see this as a form of array unflatten. Optionally, an array in the shape can be given a property "include: false" in which case the matching elements will be removed from the final shape.
function forceIntoShape(list, shape) {
	// Perform the unflattening.
	let counter = 0
	const forceIntoShapeRecursion = (shape) => {
		// Recursively set up the result.
		const result = shape.map(shapeElement => (Array.isArray(shapeElement)) ? forceIntoShapeRecursion(shapeElement) : list[counter++])

		// If the result should not be included, return undefined. If it should be included, filter out undefineds.
		if (shape.include === false)
			return undefined
		return result.filter(element => element !== undefined)
	}
	const result = forceIntoShapeRecursion(shape, 0)

	// Check if we didn't run into the end of the list.
	if (counter > list.length)
		throw new Error(`Invalid list/shape combination: the list had fewer elements than the shape, which is not allowed.`)

	return result
}
module.exports.forceIntoShape = forceIntoShape

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

// hasSimpleMatching checks if every element of one array can be matched with a term from the other array, where the given matching function decides if a matching is allowed. Only a simple matching is performed: we assume transitivity on the matching function. In other words, if A matches B and B matches C, then also A matches C.
function hasSimpleMatching(arr1, arr2, matching) {
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

// hasSimpleDeepEqualsMatching checks if two arrays can match their elements with one another through a deepEquals matching: every element in one array must be deepEqual to an element in the other array.
function hasSimpleDeepEqualsMatching(arr1, arr2) {
	if (!Array.isArray(arr1) || !Array.isArray(arr2))
		return false
	return hasSimpleMatching(arr1, arr2, deepEquals)
}
module.exports.hasSimpleDeepEqualsMatching = hasSimpleDeepEqualsMatching

// sortByIndices takes two arrays, one with values ['a', 'b', 'c'] and one with numbers like [8, 2, 4]. It sorts the number array like [2, 4, 8] but returns the array with corresponding values ['b', 'c', 'a'].
function sortByIndices(values, numbers, ascending = true) {
	// Check the input.
	if (!Array.isArray(values) || !Array.isArray(numbers))
		throw new Error(`Invalid parameter: expected arrays but received parameters of type "${typeof values}" and "${typeof numbers}".`)
	if (values.length !== numbers.length)
		throw new Error(`Invalid input: expected two arrays of equal length, but the values array was of length ${values.length} while the indices array was of length ${numbers.length}.`)
	numbers = numbers.map(number => ensureNumber(number))

	// Create an array with merged objects and sort it. Then extract the values from it.
	return values
		.map((value, index) => ({ value, number: numbers[index] }))
		.sort((a, b) => ascending ? a.number - b.number : b.number - a.number)
		.map(obj => obj.value)
}
module.exports.sortByIndices = sortByIndices