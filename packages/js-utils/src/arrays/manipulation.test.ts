import { describe, expect, it } from 'vitest'

import { deduplicate, partition, removeUndefined } from './manipulation.ts'

describe('array manipulation', () => {
	it('deduplicates while preserving first occurrences', () => {
		expect(deduplicate([2, 1, 2, 3, 1])).toEqual([2, 1, 3])
		expect(deduplicate(['A', 'a'], (a, b) => a.toLowerCase() === b.toLowerCase())).toEqual(['A'])
	})

	it('partitions without changing order or input', () => {
		const input = [1, 2, 3, 4]
		expect(partition(input, value => value % 2 === 0)).toEqual([[2, 4], [1, 3]])
		expect(input).toEqual([1, 2, 3, 4])
	})

	it('removes only undefined values', () => {
		expect(removeUndefined([0, undefined, false, null])).toEqual([0, false, null])
	})
})
