// Return the first element of an array.
export function first<T>(array: readonly T[]): T {
	if (array.length === 0) throw new RangeError('Input error: expected a non-empty array.')
	return array[0]
}

// Return the last element of an array.
export function last<T>(array: readonly T[]): T {
	if (array.length === 0) throw new RangeError('Input error: expected a non-empty array.')
	return array[array.length - 1]
}

// Return the second-last element of an array.
export function secondLast<T>(array: readonly T[]): T {
	if (array.length < 2) throw new RangeError('Input error: expected an array with at least 2 elements.')
	return array[array.length - 2]
}
