import { describe, expect, it } from 'vitest'

import { compareNumberArrays, getOneToOneMatching, hasOneToOneMatching, invertOneToOneMatching, shallowEqual } from './comparisons.ts'

describe('array comparisons', () => {
	it('compares shallow and nested numeric arrays', () => {
		const object = {}
		expect(shallowEqual([object, 1], [object, 1])).toBe(true)
		expect(shallowEqual([{}], [{}])).toBe(false)
		expect(compareNumberArrays([1, [2]], [1 + 1e-11, [2]])).toBe(true)
		expect(compareNumberArrays([1, [2]], [1, 2])).toBe(false)
	})

	it('builds and checks one-to-one matchings', () => {
		expect(getOneToOneMatching([1, 1, 2], [2, 1, 1])).toEqual([1, 2, 0])
		expect(getOneToOneMatching([1, 2], [1])).toEqual([0, undefined])
		expect(hasOneToOneMatching([{ n: 1 }], [{ n: 1 }])).toBe(true)
		expect(hasOneToOneMatching(['A'], ['a'], (a, b) => a.toLowerCase() === b.toLowerCase())).toBe(true)
	})

	it('inverts partial matchings', () => {
		expect(invertOneToOneMatching([2, undefined, 0], 4)).toEqual([2, undefined, 0, undefined])
	})
})
