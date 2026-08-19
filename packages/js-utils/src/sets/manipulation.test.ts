import { describe, expect, it } from 'vitest'

import { difference, intersection, symmetricDifference, union } from './manipulation'

describe('set manipulation', () => {
	const a = new Set([1, 2])
	const b = new Set([2, 3])

	it('calculates standard set operations', () => {
		expect([...union(a, b)]).toEqual([1, 2, 3])
		expect([...intersection(a, b)]).toEqual([2])
		expect([...difference(a, b)]).toEqual([1])
		expect([...symmetricDifference(a, b)]).toEqual([1, 3])
	})

	it('handles empty and multiple sets without mutation', () => {
		expect([...intersection<number>()]).toEqual([])
		expect([...intersection(a, b, new Set([2, 4]))]).toEqual([2])
		expect([...a]).toEqual([1, 2])
	})
})
