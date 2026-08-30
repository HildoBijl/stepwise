import { describe, expect, it } from 'vitest'

import { areIntegersEqual } from './equality.ts'

describe('areIntegersEqual', () => {
	it('compares integers exactly or with tolerances', () => {
		expect(areIntegersEqual(2, 2)).toBe(true)
		expect(areIntegersEqual(2, 3)).toBe(false)
		expect(areIntegersEqual(11, 10, { absoluteTolerance: 1 })).toBe(true)
	})

	it.each([2.5, Number.POSITIVE_INFINITY, Number.NaN])('rejects the invalid integer %s', value => {
		expect(() => areIntegersEqual(value, 2)).toThrow()
		expect(() => areIntegersEqual(2, value)).toThrow()
	})
})
