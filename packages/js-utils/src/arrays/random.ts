import { ensureInteger, ensureNumber, randomInteger } from '../numbers/index.ts'

import { last } from './reading.ts'
import { count, cumulative } from './iteration.ts'
import { integerRange } from './creation.ts'

export interface SampleOptions {
	weights?: readonly number[]
}

// Return a random element from an array.
export function sample<T>(array: readonly T[], options: SampleOptions = {}): T {
	if (array.length === 0) throw new RangeError('Input error: expected a non-empty array.')
	let { weights } = options

	// On no weights, randomly select uniformly.
	if (weights === undefined) return array[randomInteger(0, array.length - 1)]

	// Process weights.
	if (weights.length !== array.length) throw new RangeError(`Invalid weights given: expected an array of length ${array.length} but received length ${weights.length}.`)
	weights = weights.map(w => ensureNumber(w, { nonNegative: true }))
	const cumulativeWeights = cumulative(weights)
	const totalWeight = last(cumulativeWeights)
	if (totalWeight <= 0) throw new RangeError(`Invalid weights given: expected a positive total weight but received ${totalWeight}.`)

	// Randomly select item using weights.
	const random = Math.random() * totalWeight
	const index = cumulativeWeights.findIndex(cumWeight => random < cumWeight)
	return array[index]
}

// Shuffle the elements in an array using the Fisher-Yates algorithm.
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

export type RandomSelectionOptions = {
	randomOrder?: boolean
} & SampleOptions

export type RandomIndicesOptions = RandomSelectionOptions & {
	count?: number
}

export type RandomSubsetOptions = RandomSelectionOptions & {
	count: number
}

// Return randomly chosen indices from 0 up to arrayLength - 1.
export function randomIndices(arrayLength: number, options: RandomIndicesOptions = {}): number[] {
	let { count: selectionCount = arrayLength, randomOrder = true, weights } = options
	arrayLength = ensureInteger(arrayLength, { nonNegative: true })
	selectionCount = ensureInteger(selectionCount, { nonNegative: true })

	// Handle edge/error cases.
	if (selectionCount === 0) return []
	if (selectionCount > arrayLength) throw new RangeError(`Invalid input: cannot select ${selectionCount} unique indices from an array of length ${arrayLength}.`)

	// Determine the indices.
	let indices: number[]
	if (weights !== undefined) {
		// Check the weights.
		if (weights.length !== arrayLength) throw new RangeError(`Invalid weights given: expected an array of length ${arrayLength} but received length ${weights.length}.`)
		weights = weights.map(w => ensureNumber(w, { nonNegative: true }))
		const selectableCount = count(weights, weight => weight > 0)
		if (selectableCount < selectionCount) throw new RangeError(`Invalid weights given: insufficient positive-weight indices (required ${selectionCount}, available ${selectableCount}).`)

		// Pick one item and exclude it afterwards.
		const index = sample(integerRange(0, arrayLength - 1), { weights })
		indices = [index, ...randomIndices(arrayLength, { count: selectionCount - 1, randomOrder, weights: weights.map((weight, weightIndex) => weightIndex === index ? 0 : weight) })]
	} else {
		indices = shuffle(integerRange(0, arrayLength - 1)).slice(0, selectionCount)
	}

	// If required, sort the indices.
	return randomOrder ? indices : indices.sort((a, b) => a - b)
}

// Return a random subset of an array.
export function randomSubset<T>(array: readonly T[], options: RandomSubsetOptions): T[] {
	const mapping = randomIndices(array.length, options)
	return mapping.map(index => array[index])
}
