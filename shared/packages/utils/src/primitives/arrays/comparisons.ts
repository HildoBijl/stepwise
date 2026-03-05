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

// Check if arrays have a one-to-one matching under a matcher (multiset equality under an equivalence relation). This assumes the matcher is transitive (i.e. an equivalence relation).
export function hasOneToOneMatching<T>(a: readonly T[], b: readonly T[], matching: (x: T, y: T) => boolean = deepEquals): boolean {
	if (a.length !== b.length) return false
	const matched = a.map(() => false)
	return a.every(x => {
		const i = b.findIndex((y, j) => !matched[j] && matching(x, y))
		if (i === -1) return false
		matched[i] = true
		return true
	})
}
