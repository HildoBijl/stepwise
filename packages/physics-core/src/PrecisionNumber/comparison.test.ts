import { describe, expect, test } from 'vitest'

import { adjustPrecisionNumberTolerances, defaultPrecisionNumberEqualityOptions, isPrecisionNumberEqualityOptionsInput, resolvePrecisionNumberEqualityOptions } from './comparison.ts'

describe('PrecisionNumber comparison options', () => {
	test('resolves defaults and applies the minimum absolute tolerance', () => {
		expect(resolvePrecisionNumberEqualityOptions({}, 0.25)).toEqual({ ...defaultPrecisionNumberEqualityOptions, absoluteTolerance: 0.25 })
	})

	test('keeps a larger explicit absolute tolerance', () => {
		expect(resolvePrecisionNumberEqualityOptions({ absoluteTolerance: 0.5 }, 0.25).absoluteTolerance).toBe(0.5)
	})

	test('adjusts numeric tolerances by a conversion factor', () => {
		const result = adjustPrecisionNumberTolerances({ absoluteTolerance: 2 }, 1000, 0)
		expect(result.absoluteTolerance).toBe(2000)
	})

	test('recognizes PrecisionNumber equality option inputs', () => {
		expect(isPrecisionNumberEqualityOptionsInput({})).toBe(true)
		expect(isPrecisionNumberEqualityOptionsInput({ absoluteTolerance: 1, significantDigitTolerance: 2, checkPower: true })).toBe(true)
		expect(isPrecisionNumberEqualityOptionsInput({ significantDigitTolerance: Infinity })).toBe(true)
		expect(isPrecisionNumberEqualityOptionsInput(undefined)).toBe(false)
		expect(isPrecisionNumberEqualityOptionsInput({ significantDigitTolerance: -1 })).toBe(false)
		expect(isPrecisionNumberEqualityOptionsInput({ significantDigitTolerance: 1.5 })).toBe(false)
		expect(isPrecisionNumberEqualityOptionsInput({ checkPower: 'yes' })).toBe(false)
		expect(isPrecisionNumberEqualityOptionsInput({ absoluteTolerance: -1 })).toBe(false)
		expect(isPrecisionNumberEqualityOptionsInput({ extra: true })).toBe(false)
	})

	test('rejects invalid options and conversion factors', () => {
		expect(() => resolvePrecisionNumberEqualityOptions({ significantDigitTolerance: -1 }, 0)).toThrow(/non-negative integer/)
		expect(() => resolvePrecisionNumberEqualityOptions({ checkPower: 'yes' as never }, 0)).toThrow(/boolean/)
		expect(() => adjustPrecisionNumberTolerances({}, 0, 0)).toThrow(/zero/)
	})
})
