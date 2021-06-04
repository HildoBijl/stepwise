const { ensureInt, ensureNumber } = require('./numbers')

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

// firstOf takes an array and returns its first item. Yes, you can do [0], but this may look prettier if you already use lastOf.
function firstOf(array) {
	return array[0]
}
module.exports.firstOf = firstOf

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

// getRandomSubset takes an array like ['A', 'B', 'C', 'D'] and randomly picks num elements out of it. For instance, if num = 2 then it may return ['D', 'B']. If randomOrder is set to true (default) then the order is random. If it is set to false, then the elements will always appear in the same order as in the original array. (Note: for huge arrays and a small subset this function is not optimized for efficiency.)
function getRandomSubset(array, num, randomOrder = true) {
	// Check input.
	array = ensureArray(array)
	num = ensureInt(num)

	// Create a mapping of the right size.
	const mapping = shuffle(numberArray(0, array.length - 1)).slice(0, num)

	// The mapping is in random order. If we don't want a random order, we must sort it.
	if (!randomOrder)
		mapping.sort()

	return mapping.map(index => array[index])
}
module.exports.getRandomSubset = getRandomSubset

// count takes an array and a function and checks for how many elements this function returns a truthy value.
function count(array, fun) {
	return array.reduce((sum, item) => sum + (fun(item) ? 1 : 0), 0)
}
module.exports.count = count

// hasDuplicates checks if an array has duplicates. Optionally, an equals function can be defined.
function hasDuplicates(array, equals = (a,b) => a === b) {
	const duplicate = array.find((x, index) => {
		return array.find((y, index2) => {
			return index < index2 && equals(x,y)
		})
	})
	return duplicate !== undefined
}
module.exports.hasDuplicates = hasDuplicates

// flattenFully flattens an array until it has no arrays left.
function flattenFully(arr) {
	while (arr.some(element => Array.isArray(element)))
		arr = arr.flat()
	return arr
}
module.exports.flattenFully = flattenFully

// forceIntoShape takes a list and turns it into the shape given by the shape argument. If you provide a list [3, 5, 7, 9, 11] and a shape [[*, *], *, [*, [*]]], then the result will be [[3, 5], 7, [9, [11]]]. (The values of the shape do not matter.) You could see this as a form of array unflatten.
function forceIntoShape(list, shape) {
	// Perform the unflattening.
	let counter = 0
	const forceIntoShapeRecursion = (shape) => shape.map(shapeElement => (Array.isArray(shapeElement)) ? forceIntoShapeRecursion(shapeElement) : list[counter++])
	const result = forceIntoShapeRecursion(shape, 0)

	// Check if we didn't run into the end of the list.
	if (counter > list.length)
		throw new Error(`Invalid list/shape combination: the list had fewer elements than the shape, which is not allowed.`)
	return result
}
module.exports.forceIntoShape = forceIntoShape