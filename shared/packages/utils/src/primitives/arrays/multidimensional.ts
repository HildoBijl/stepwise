// Get the dimensions of a multi-dimensional array (matrix).
export type NestedArray<T> = readonly (T | NestedArray<T>)[]
export function getDimensions<T>(matrix: NestedArray<T>): number[] {
	const dimensions: number[] = []
	let current: NestedArray<T> | T = matrix
	while (Array.isArray(current)) {
		dimensions.push(current.length)
		current = current[0]
	}
	return dimensions
}

// Get an element from a matrix using a list of indices.
export function getMatrixElement<T>(matrix: NestedArray<T>, indices: readonly number[]): T {
	let result: NestedArray<T> | T = matrix
	for (const index of indices) {
		if (!Array.isArray(result)) throw new RangeError(`Invalid matrix access: expected an array while following indices ${indices.join(',')}.`)
		if (index < 0 || index >= result.length) throw new RangeError(`Invalid matrix access: index ${index} is out of bounds.`)
		result = result[index]
	}
	return result as T
}
