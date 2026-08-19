import { describe, expect, it } from 'vitest'

import { ensureDate, isDate } from './checks'

describe('date checks', () => {
	it('recognizes only valid dates', () => {
		expect(isDate(new Date(0))).toBe(true)
		expect(isDate(new Date(Number.NaN))).toBe(false)
		expect(isDate('2020-01-01')).toBe(false)
	})

	it('keeps dates and converts supported inputs', () => {
		const date = new Date(0)
		expect(ensureDate(date)).toBe(date)
		expect(ensureDate(0).getTime()).toBe(0)
		expect(() => ensureDate('not a date')).toThrow(TypeError)
	})
})
