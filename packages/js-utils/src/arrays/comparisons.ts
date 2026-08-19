import { approximatelyEqual } from '../numbers'
import { deepEqual } from '../objects'

import { isArray } from './checks'

// Check whether two arrays are shallow-equal (element-wise ===).
export function shallowEqual<T>(a: readonly T[], b: readonly T[]): boolean {
	return a.length === b.length && a.every((x, i) => x === b[i])
}

// Compare (possibly nested) number arrays using approximatelyEqual for numbers.
type NestedNumber = number | readonly NestedNumber[]
export function compareNumberArrays(a: readonly NestedNumber[], b: readonly NestedNumber[]): boolean {
	return a.length === b.length && a.every((x, i) => {
		const y = b[i]
		if (isArray(x)) return isArray(y) && compareNumberArrays(x, y)
		return !isArray(y) && approximatelyEqual(x, y)
	})
}

// Get a one-to-one matching between two arrays. The result maps each index of a to its matching index in b. This assumes the matcher is transitive. Returns a partial matching if not all items can be matched.
export type OneToOneMatching = readonly (number | undefined)[]
export function getOneToOneMatching<T>(a: readonly T[], b: readonly T[], matcher: (x: T, y: T) => boolean = deepEqual): OneToOneMatching {
	const matched = b.map(() => false)
	return a.map(x => {
		const index = b.findIndex((y, index) => !matched[index] && matcher(x, y))
		if (index === -1) return undefined
		matched[index] = true
		return index
	})
}

// Check if arrays have a one-to-one matching under a matcher (multiset equality under an equivalence relation). This assumes the matcher is transitive.
export function hasOneToOneMatching<T>(a: readonly T[], b: readonly T[], matcher: (x: T, y: T) => boolean = deepEqual): boolean {
	return a.length === b.length && getOneToOneMatching(a, b, matcher).every(matchedIndex => matchedIndex !== undefined)
}

// Invert a matching from a to b into one from b to a.
export function invertOneToOneMatching(matching: OneToOneMatching, invertedLength = matching.length): OneToOneMatching {
	const result: (number | undefined)[] = Array(invertedLength).fill(undefined)
	matching.forEach((value, index) => {
		if (value !== undefined) result[value] = index
	})
	return result
}
