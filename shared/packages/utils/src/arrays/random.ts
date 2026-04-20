import { ensureInt, ensureNumber, randomInteger } from '../numbers'
import { cumulative, last, integerRange, sum } from '../arrays'

// Return a random element from an array.
export function sample<T>(array: readonly T[], weights?: readonly number[]): T {
	if (array.length === 0) throw new RangeError('Input error: expected a non-empty array.')

	// On no weights, randomly select uniformly.
	if (weights === undefined) return array[randomInteger(0, array.length - 1)]

	// Process weights.
	if (weights.length !== array.length) throw new RangeError(`Invalid weights given: expected an array of length ${array.length} but received length ${weights.length}.`)
	weights = weights.map(w => ensureNumber(w, true))
	const cumulativeWeights = cumulative(weights)
	const totalWeight = last(cumulativeWeights)
	if (totalWeight <= 0) throw new RangeError(`Invalid weights given: expected a positive total weight but received ${totalWeight}.`)

	// Randomly select item using weights.
	const random = Math.random() * totalWeight
	const index = cumulativeWeights.findIndex(cumWeight => random <= cumWeight)
	return array[index]
}

// Shuffle the elements in an array using the Fisher–Yates algorithm.
export function shuffle<T>(array: readonly T[]): T[] {
	const result = [...array]
	for (let currIndex = result.length - 1; currIndex > 0; currIndex--) {
		const newPlace = Math.floor(Math.random() * (currIndex + 1))
		const temp = result[newPlace]
		result[newPlace] = result[currIndex]
		result[currIndex] = temp
	}
	return result
}

// Return a number of randomly chosen indices from 0 up to arrayLength - 1.
export function randomIndices(arrayLength: number, num: number = arrayLength, randomOrder: boolean = true, weights?: readonly number[]): number[] {
	arrayLength = ensureInt(arrayLength, true)
	num = ensureInt(num, true)

	// Handle edge/error cases.
	if (num === 0) return []
	if (num > arrayLength) throw new RangeError(`Invalid input: cannot select ${num} unique indices from an array of length ${arrayLength}.`)

	// Determine the indices.
	let indices: number[]
	if (weights !== undefined) {
		// Check the weights.
		if (weights.length !== arrayLength) throw new RangeError(`Invalid weights given: expected an array of length ${arrayLength} but received length ${weights.length}.`)
		weights = weights.map(w => ensureNumber(w, true))
		if (sum(weights) === 0) throw new RangeError(`Invalid weights given: did not have sufficient options with nonzero weight.`)

		// Pick one item and exclude it afterwards.
		const index = sample(integerRange(0, arrayLength - 1), weights)
		indices = [index, ...randomIndices(arrayLength, num - 1, randomOrder, weights.map((weight, weightIndex) => weightIndex === index ? 0 : weight)),
		]
	} else {
		indices = shuffle(integerRange(0, arrayLength - 1)).slice(0, num)
	}

	// If required, sort the indices.
	return randomOrder ? indices : indices.sort((a, b) => a - b)
}

// Return a random subset of an array.
export function randomSubset<T>(array: readonly T[], num: number, randomOrder: boolean = true, weights?: readonly number[]): T[] {
	const mapping = randomIndices(array.length, num, randomOrder, weights)
	return mapping.map(index => array[index])
}
