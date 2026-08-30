import { describe, expect, it } from 'vitest'

import { areMultipleChoiceSelectionsEqual } from './equality.ts'

describe('areMultipleChoiceSelectionsEqual', () => {
	it('compares scalar and order-independent list answers', () => {
		expect(areMultipleChoiceSelectionsEqual(2, 2)).toBe(true)
		expect(areMultipleChoiceSelectionsEqual(2, 3)).toBe(false)
		expect(areMultipleChoiceSelectionsEqual([1, 2], [2, 1])).toBe(true)
		expect(areMultipleChoiceSelectionsEqual([1, 2], [1, 3])).toBe(false)
	})

	it('rejects duplicate, negative, and fractional options', () => {
		expect(() => areMultipleChoiceSelectionsEqual([1, 1], [1, 2])).toThrow(/duplicate/)
		expect(() => areMultipleChoiceSelectionsEqual([-1], [1])).toThrow()
		expect(() => areMultipleChoiceSelectionsEqual([1.5], [1])).toThrow()
	})
})
