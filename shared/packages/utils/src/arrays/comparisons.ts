import { compareNumbers } from '../numbers'
import { deepEquals } from '../objects'

// Check whether two arrays are shallow-equal (element-wise ===).
export function shallowEqual<T>(a: readonly T[], b: readonly T[]): boolean {
	return a.length === b.length && a.every((x, i) => x === b[i])
}

// Compare (possibly nested) number arrays using compareNumbers for numbers.
type NestedNumber = number | NestedNumber[]
export function compareNumberArrays(a: readonly NestedNumber[], b: readonly NestedNumber[]): boolean {
	return a.length === b.length && a.every((x, i) => {
		const y = b[i]
		if (Array.isArray(x)) return Array.isArray(y) && compareNumberArrays(x, y)
		return !Array.isArray(y) && compareNumbers(x, y)
	})
}

// Get a one-to-one matching between two arrays. The result maps each index of a to its matching index in b. This assumes the matcher is transitive. Returns a partial matching if not all items can be matched.
export type Matching = readonly (number | undefined)[]
export function getOneToOneMatching<T>(a: readonly T[], b: readonly T[], matcher: (x: T, y: T) => boolean = deepEquals): Matching {
	const matched = b.map(() => false)
	return a.map(x => {
		const index = b.findIndex((y, index) => !matched[index] && matcher(x, y))
		if (index === -1) return undefined
		matched[index] = true
		return index
	})
}

// Check if arrays have a one-to-one matching under a matcher (multiset equality under an equivalence relation). This assumes the matcher is transitive.
export function hasOneToOneMatching<T>(a: readonly T[], b: readonly T[], matcher: (x: T, y: T) => boolean = deepEquals): boolean {
	return a.length === b.length && getOneToOneMatching(a, b, matcher).every(matchedIndex => matchedIndex !== undefined)
}

// Reverse a matching from a → b into one from b → a.
export function reverseMatching(matching: Matching, targetLength = matching.length): Matching {
	const result: (number | undefined)[] = Array(targetLength).fill(undefined)
	matching.forEach((value, index) => {
		if (value !== undefined) result[value] = index
	})
	return result
}
