// Find the first element for which fn returns a non-undefined value, and return the index, the corresponding element, and the returned value.
export function findWithValue<T, V>(array: readonly T[], fn: (element: T, index: number, array: readonly T[]) => V | undefined): { index: number; element: T; value: V } | undefined {
	for (let index = 0; index < array.length; index++) {
		const element = array[index]
		const value = fn(element, index, array)
		if (value) return { index, element, value: value as V }
	}
	return undefined
}

// Find the first element for which fn returns a non-undefined value, and return that value.
export function findValue<T, V>(array: readonly T[], fn: (element: T, index: number, array: readonly T[]) => V | undefined): V | undefined {
	return findWithValue(array, fn)?.value
}

// Find the index path of a value inside a nested array structure.
type NestedArray<T> = readonly (T | NestedArray<T>)[]
export function findIndexPath<T>(array: NestedArray<T>, elementToFind: T): number[] | undefined {
	const result = findWithValue(array, (element, index) => {
		if (element === elementToFind) return [index]
		if (Array.isArray(element)) {
			const trace = findIndexPath(element, elementToFind)
			return trace && [index, ...trace]
		}
		return undefined
	})
	return result?.value
}

// Find the index of the optimum element according to isBetter. Returns -1 on an empty array.
export function findOptimumIndex<T>(array: readonly T[], isBetter: (a: T, b: T) => boolean): number {
	return array.reduce((bestIndex, element, index) => bestIndex === -1 || isBetter(element, array[bestIndex]) ? index : bestIndex, -1)
}

// Find the optimum element according to isBetter. Returns undefined on an empty array.
export function findOptimum<T>(array: readonly T[], isBetter: (a: T, b: T) => boolean): T | undefined {
	const index = findOptimumIndex(array, isBetter)
	return index === -1 ? undefined : array[index]
}
