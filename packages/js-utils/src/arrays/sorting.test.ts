import { describe, expect, it } from 'vitest'

import { sortBy } from './sorting.ts'

describe('array sorting', () => {
	it('sorts values by corresponding numbers', () => {
		const values = ['a', 'b', 'c']
		expect(sortBy(values, [2, 1, 3])).toEqual(['b', 'a', 'c'])
		expect(sortBy(values, [2, 1, 3], { order: 'descending' })).toEqual(['c', 'a', 'b'])
		expect(values).toEqual(['a', 'b', 'c'])
	})

	it('keeps equal entries stable and validates input', () => {
		expect(sortBy(['a', 'b', 'c'], [1, 1, 0])).toEqual(['c', 'a', 'b'])
		expect(() => sortBy(['a'], [])).toThrow(RangeError)
		expect(() => sortBy(['a'], [Number.NaN])).toThrow(TypeError)
	})
})
