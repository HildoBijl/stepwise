const { ensureInt } = require('./numbers')
const { ensureArray, getCumulativeArray, lastOf, numberArray, shuffle, sum } = require('./arrays')

// getRandomBoolean returns true or false, randomly. Optionally, the probability for true can be given.
function getRandomBoolean(probability = 0.5) {
	return Math.random() < probability
}
module.exports.getRandomBoolean = getRandomBoolean

// getRandom returns a random floating number between the given minimum and maximum.
function getRandom(min, max) {
	return min + (max - min) * Math.random()
}
module.exports.getRandom = getRandom

/* getRandomInteger returns a random integer between the given min and max (both inclusive) according to a uniform distribution. It must receive these parameters:
 * - min (obligatory): the minimum value (inclusive).
 * - max (obligatory): the maximum value (inclusive).
 * - prevent: an integer or array of integers to exclude. For instance, using { min: -3, max: 3, prevent: [-1, 0, 1] } will give either -3, -2, 2 or 3.
 */
function getRandomInteger(min, max, prevent = []) {
	// Check input: must be numbers.
	min = ensureInt(min)
	max = ensureInt(max)
	prevent = Array.isArray(prevent) ? prevent : [prevent]

	// Check the number of options.
	if (max - min + 1 <= prevent.length)
		throw new Error(`Invalid getRandomInteger options: we tried to generate a random number between ${max} and ${min}, but (after taking into account a prevent-array) there were no options left.`)

	// Set up a random integer number.
	const number = Math.floor(Math.random() * (max - min + 1)) + min

	// Check if it's in the prevent list. If so, repeat to eventually find something.
	if (prevent.includes(number))
		return getRandomInteger(min, max, prevent)

	// All good!
	return number
}
module.exports.getRandomInteger = getRandomInteger

// selectRandomly takes an array and returns a random element from it.
function selectRandomly(arr, weights) {
	// If there are no weights, just pick one uniformly randomly.
	arr = ensureArray(arr)
	if (weights === undefined)
		return arr[getRandomInteger(0, arr.length - 1)]

	// If there are weights, apply them.
	const cumWeights = getCumulativeArray(weights)
	const random = Math.random() * lastOf(cumWeights)
	const index = cumWeights.findIndex(cumWeight => random <= cumWeight)
	return arr[index]
}
module.exports.selectRandomly = selectRandomly

// getRandomIndices takes an array length, like 5, and a number of indices that need to be chosen, like 3. It then returns an array with that many randomly chosen indices. Like [4, 0, 3]. If randomOrder is manually set to false, they will appear in order. (So [0, 3, 4] in the example.) Note: the given arrayLength number is an exclusive bound: it itself never appears in the array.
function getRandomIndices(arrayLength, num = arrayLength, randomOrder = true, weights) {
	if (num === 0)
		return []

	// Determine the indices.
	let indices
	if (weights) {
		// Run a basic check on the weights.
		if (!Array.isArray(weights) || weights.length !== arrayLength)
			throw new Error(`Invalid weights given: expected an array of length ${arrayLength} but received "${JSON.stringify(weights)}".`)
		if (sum(weights) === 0)
			throw new Error(`Invalid weights given: did not have sufficient options with nonzero weight. Received a weights array ${JSON.stringify(weights)}.`)

		// Pick one item and exclude it afterwards.
		const index = selectRandomly(numberArray(0, arrayLength - 1), weights)
		indices = [index, ...getRandomIndices(arrayLength, num - 1, randomOrder, weights.map((weight, weightIndex) => weightIndex === weight ? 0 : weight))]
	} else {
		indices = shuffle(numberArray(0, arrayLength - 1)).slice(0, num)
	}

	// If required, sort the indices.
	return randomOrder ? indices : indices.sort((a, b) => a - b)
}
module.exports.getRandomIndices = getRandomIndices

// getRandomSubset takes an array like ['A', 'B', 'C', 'D'] and randomly picks num elements out of it. For instance, if num = 2 then it may return ['D', 'B']. If randomOrder is set to true (default) then the order is random. If it is set to false, then the elements will always appear in the same order as in the original array. (Note: for huge arrays and a small subset this function is not optimized for efficiency.)
function getRandomSubset(array, num, randomOrder = true, weights) {
	// Check input.
	array = ensureArray(array)
	num = ensureInt(num)

	// Create a mapping of the right size and apply it.
	const mapping = getRandomIndices(array.length, num, randomOrder, weights)
	return mapping.map(index => array[index])
}
module.exports.getRandomSubset = getRandomSubset
