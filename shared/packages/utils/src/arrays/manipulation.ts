// Splice an array without mutating it.
export function arraySplice<T>(array: readonly T[], index: number, numItemsToRemove: number = 0, ...insertItems: T[]): T[] {
	const result = [...array]
	result.splice(index, numItemsToRemove, ...insertItems)
	return result
}

// Remove duplicates from an array. Optionally, an equals function can be specified.
export function filterDuplicates<T>(array: readonly T[], equals: (a: T, b: T) => boolean = (a, b) => a === b): T[] {
	return array.filter((value, index) => !array.some((otherValue, otherIndex) => otherIndex < index && equals(value, otherValue)))
}

// Filter array but keep removed elements in another array.
export function splitArray<T>(array: readonly T[], filter: (value: T, index: number, array: readonly T[]) => boolean): [kept: T[], removed: T[]] {
	const kept: T[] = [], removed: T[] = []
	array.forEach((value, index) => (filter(value, index, array) ? kept : removed).push(value))
	return [kept, removed]
}

// Fill all undefined values in an array with the given value.
export function fillUndefinedWith<T>(array: readonly (T | undefined)[], filler: T): T[] {
	return Array.from(array, a => a === undefined ? filler : a)
}
