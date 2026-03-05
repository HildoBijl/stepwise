import { ensureNumberArray } from './checks'

// Return the sum of all array elements.
export function sum(array: readonly number[]): number {
	return array.reduce((sum, v) => sum + v, 0)
}

// Return the product of all array elements.
export function product(array: readonly number[]): number {
	return array.reduce((product, v) => product * v, 1)
}

// Count the number of elements for which the given function returns truthy.
export function count<T>(array: readonly T[], fn: (value: T, index: number) => unknown): number {
	return array.reduce((sum, item, index) => sum + (fn(item, index) ? 1 : 0), 0)
}

// Return the cumulative sum of a number array.
export function cumulative(array: readonly number[]): number[] {
	let sum = 0
	return array.map(v => sum += v)
}
