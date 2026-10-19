import { describe, expect, it } from 'vitest'

import { isValidLocale } from './locale.ts'

describe('locale validation', () => {
	it('accepts language and regional locale identifiers', () => {
		expect(isValidLocale('nl')).toBe(true)
		expect(isValidLocale('en-GB')).toBe(true)
	})

	it('rejects empty and malformed locale identifiers', () => {
		expect(isValidLocale('')).toBe(false)
		expect(isValidLocale('invalid_locale')).toBe(false)
	})
})
