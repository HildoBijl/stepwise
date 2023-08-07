const { ensureInt } = require('./numbers')
const { ensureArray, cumulative, lastOf, numberArray, shuffle, sum } = require('./arrays')

// selectRandomly takes an array and returns a random element from it.
function selectRandomly(arr, weights) {
	// If there are no weights, just pick one uniformly randomly.
	arr = ensureArray(arr)
	if (weights === undefined)
		return arr[getRandomInteger(0, arr.length - 1)]

	// If there are weights, apply them.
	const cumulativeWeights = cumulative(weights)
	const random = Math.random() * lastOf(cumulativeWeights)
	const index = cumulativeWeights.findIndex(cumWeight => random <= cumWeight)
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
		indices = [index, ...getRandomIndices(arrayLength, num - 1, randomOrder, weights.map((weight, weightIndex) => weightIndex === index ? 0 : weight))]
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
