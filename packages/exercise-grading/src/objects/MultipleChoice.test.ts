import { describe, expect, it } from 'vitest'

import { compareMultipleChoice } from './MultipleChoice.ts'

describe('compareMultipleChoice', () => {
	it('compares scalar and order-independent list answers', () => {
		expect(compareMultipleChoice(2, 2)).toBe(true)
		expect(compareMultipleChoice(2, 3)).toBe(false)
		expect(compareMultipleChoice([1, 2], [2, 1])).toBe(true)
		expect(compareMultipleChoice([1, 2], [1, 3])).toBe(false)
	})

	it('rejects duplicate, negative, and fractional options', () => {
		expect(() => compareMultipleChoice([1, 1], [1, 2])).toThrow(/duplicate/)
		expect(() => compareMultipleChoice([-1], [1])).toThrow()
		expect(() => compareMultipleChoice([1.5], [1])).toThrow()
	})
})
