import { describe, expect, it } from 'vitest'

import { ensureInteger, ensureNumber, ensureNumeric, ensureNumericInteger, isInteger, isNumber, isNumeric, isNumericInteger } from './checks.ts'

describe('number checks', () => {
	it('distinguishes numbers from numeric strings', () => {
		expect(isNumber(2)).toBe(true)
		expect(isNumber(Number.NaN)).toBe(false)
		expect(isNumber('2')).toBe(false)
		expect(isNumeric(' 2.5 ')).toBe(true)
		expect(isNumeric('')).toBe(false)
		expect(isNumeric('two')).toBe(false)
	})

	it('distinguishes integers from numeric integer strings', () => {
		expect(isInteger(2)).toBe(true)
		expect(isInteger(2.1)).toBe(false)
		expect(isNumericInteger('2')).toBe(true)
		expect(isNumericInteger('2.1')).toBe(false)
	})

	it('keeps strict ensures strict and normalizes numeric strings explicitly', () => {
		expect(ensureNumber(2)).toBe(2)
		expect(() => ensureNumber('2')).toThrow(TypeError)
		expect(ensureNumeric(' 2.5 ')).toBe(2.5)
		expect(ensureInteger(2)).toBe(2)
		expect(() => ensureInteger('2')).toThrow(TypeError)
		expect(ensureNumericInteger('2')).toBe(2)
		expect(() => ensureNumericInteger('2.1')).toThrow(TypeError)
	})

	it('applies number constraints', () => {
		expect(() => ensureNumber(-1, { nonNegative: true })).toThrow(RangeError)
		expect(() => ensureNumber(0, { nonZero: true })).toThrow(RangeError)
		expect(() => ensureNumber(Infinity)).toThrow(TypeError)
		expect(ensureNumber(Infinity, { allowInfinity: true })).toBe(Infinity)
	})

	it('optionally requires safe integers', () => {
		const unsafeInteger = Number.MAX_SAFE_INTEGER + 1
		expect(ensureInteger(Number.MAX_SAFE_INTEGER, { safe: true })).toBe(Number.MAX_SAFE_INTEGER)
		expect(() => ensureInteger(unsafeInteger, { safe: true })).toThrow(RangeError)
		expect(() => ensureNumericInteger(String(unsafeInteger), { safe: true })).toThrow(RangeError)
		expect(() => ensureInteger(Infinity, { safe: true, allowInfinity: true })).toThrow(RangeError)
	})
})
