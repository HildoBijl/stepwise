// Flatten an array until it has no arrays left.
type NestedArray<T> = T | NestedArray<T>[]
export function flattenDeep<T>(array: readonly NestedArray<T>[]): T[] {
	let result: unknown[] = [...array]
	while (result.some(x => Array.isArray(x))) result = (result as any[]).flat()
	return result as T[]
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
