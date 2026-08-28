import { describe, expect, it } from 'vitest'

import { formatDate } from './formatting.ts'

describe('date formatting', () => {
	it('formats local date and time components', () => {
		const date = new Date(2024, 0, 2, 3, 4, 5)
		expect(formatDate(date)).toBe('2024-01-02')
		expect(formatDate(date, { includeTime: true })).toBe('2024-01-02 03:04')
		expect(formatDate(date, { includeTime: true, includeSeconds: true })).toBe('2024-01-02 03:04:05')
	})

	it('rejects seconds without a time and invalid dates', () => {
		expect(() => formatDate(new Date(), { includeSeconds: true })).toThrow(RangeError)
		expect(() => formatDate(new Date(Number.NaN))).toThrow(TypeError)
	})
})
