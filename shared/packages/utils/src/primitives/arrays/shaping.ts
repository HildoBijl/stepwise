// Flatten an array until it has no arrays left.
type NestedArray<T> = T | NestedArray<T>[]
export function flattenDeep<T>(array: readonly NestedArray<T>[]): T[] {
	let result: unknown[] = [...array]
	while (result.some(x => Array.isArray(x))) result = (result as any[]).flat()
	return result as T[]
}

// Take a list and turn it into the shape given by the shape argument. Arrays inside the shape may have an optional property include=false, in which case the matching subtree is removed.
export type ShapeTemplate = readonly ShapeTemplate[] | unknown
export type ShapeArray = readonly ShapeTemplate[] & { include?: boolean }
export function forceIntoShape<T>(list: readonly T[], shape: ShapeArray): unknown {
	// Build up the shape by recursively walking through the shape, adding entries from the list as we go.
	let counter = 0
	const recurse = (node: ShapeArray): unknown => {
		const result = node.map(child => {
			if (Array.isArray(child)) return recurse(child as ShapeArray)
			return list[counter++]
		})
		if (node.include === false) return undefined
		return result.filter(x => x !== undefined)
	}
	const result = recurse(shape)

	// Check that the whole list has been used.
	if (counter != list.length)
		throw new RangeError(`Invalid list/shape combination: the list had ${list.length} elements and the shape had ${counter} elements.`)
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
