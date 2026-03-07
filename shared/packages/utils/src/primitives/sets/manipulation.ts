// Apply a union to two or more sets.
export function union<T>(...sets: readonly ReadonlySet<T>[]): Set<T> {
	const result = new Set<T>()
	for (const set of sets) {
		for (const value of set) {
			result.add(value)
		}
	}
	return result
}

// Apply an intersection to two or more sets.
export function intersection<T>(...sets: readonly ReadonlySet<T>[]): Set<T> {
	if (sets.length === 0) return new Set<T>()
	const result = new Set<T>(sets[0])
	for (const set of sets.slice(1)) {
		for (const value of result) {
			if (!set.has(value)) result.delete(value)
		}
	}
	return result
}

// Return the difference of two sets (setA − setB).
export function difference<T>(setA: ReadonlySet<T>, setB: ReadonlySet<T>): Set<T> {
	const result = new Set(setA)
	for (const value of setB)
		result.delete(value)
	return result
}

// Return the symmetric difference of two sets.
export function symmetricDifference<T>(setA: ReadonlySet<T>, setB: ReadonlySet<T>): Set<T> {
	const result = new Set(setA)
	for (const value of setB) {
		if (result.has(value)) result.delete(value)
		else result.add(value)
	}
	return result
}
