import { type NestedArray } from './finding'

// Flatten an array until it has no arrays left.
export function flattenDeep<T>(array: NestedArray<T>): T[] {
	const result: T[] = []
	const appendValues = (values: readonly unknown[]): void => {
		for (const value of values) {
			if (Array.isArray(value)) appendValues(value)
			else result.push(value as T)
		}
	}
	appendValues(array as readonly unknown[])
	return result
}

// Return all combinations picking one element from each sub-array (Cartesian product).
export function cartesianProduct<T>(list: readonly (readonly T[])[]): T[][] {
	// Check edge cases.
	if (list.length === 0) throw new RangeError('Input error: cartesianProduct expects a non-empty array of arrays.')
	if (list.length === 1) return list[0].map(x => [x])

	// Recursively set up the Cartesian product.
	const result: T[][] = []
	const left = list[0]
	const later = cartesianProduct(list.slice(1))
	left.forEach(x => {
		later.forEach(tail => {
			result.push([x, ...tail])
		})
	})
	return result
}
