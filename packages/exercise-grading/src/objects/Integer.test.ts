import { describe, expect, it } from 'vitest'

import { compareInteger } from './Integer.ts'

describe('compareInteger', () => {
	it('compares integers exactly or with tolerances', () => {
		expect(compareInteger(2, 2)).toBe(true)
		expect(compareInteger(2, 3)).toBe(false)
		expect(compareInteger(11, 10, { absoluteTolerance: 1 })).toBe(true)
	})

	it.each([2.5, Number.POSITIVE_INFINITY, Number.NaN])('rejects the invalid integer %s', value => {
		expect(() => compareInteger(value, 2)).toThrow()
		expect(() => compareInteger(2, value)).toThrow()
	})
})
