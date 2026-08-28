import { describe, expect, it } from 'vitest'

import { adjustNumberTolerances, approximatelyEqual, checkNumberEquality, compareNumbers, getAbsoluteDifference, getRelativeDifference, isMultipleOf, numbersEqual, resolveNumberEqualityOptions, validateNumberEqualityOptions } from './comparisons.ts'

describe('number comparisons', () => {
	it('compares numbers approximately and directionally', () => {
		expect(approximatelyEqual(1, 1 + 1e-11)).toBe(true)
		expect(approximatelyEqual(Infinity, Infinity)).toBe(true)
		expect(approximatelyEqual(Infinity, -Infinity)).toBe(false)
		expect(compareNumbers(2, 1)).toBe(1)
		expect(compareNumbers(1, 2)).toBe(-1)
		expect(compareNumbers(1, 1)).toBe(0)
	})

	it('checks configured absolute and relative tolerances', () => {
		expect(numbersEqual(10.1, 10, { absoluteTolerance: 0.1 })).toBe(true)
		expect(numbersEqual(101, 100, { relativeTolerance: 0.01 })).toBe(true)
		expect(checkNumberEquality(4, 5)).toMatchObject({ equal: false, direction: -1, absoluteDifference: 1, relativeDifference: 0.2 })
	})

	it('resolves, validates and adjusts options', () => {
		expect(resolveNumberEqualityOptions({ absoluteTolerance: 2 })).toEqual({ absoluteTolerance: 2, relativeTolerance: 0 })
		expect(validateNumberEqualityOptions({ absoluteTolerance: 1, relativeTolerance: Infinity })).toEqual({ absoluteTolerance: 1, relativeTolerance: Infinity })
		expect(() => validateNumberEqualityOptions({ absoluteTolerance: -1, relativeTolerance: 0 })).toThrow(RangeError)
		expect(adjustNumberTolerances({ absoluteTolerance: 2, relativeTolerance: 0.1 }, 3)).toEqual({ absoluteTolerance: 6, relativeTolerance: 0.30000000000000004 })
	})

	it('calculates differences and multiples', () => {
		expect(getAbsoluteDifference(-2, 3)).toBe(5)
		expect(getRelativeDifference(8, 10)).toBe(0.2)
		expect(getRelativeDifference(Infinity, 1)).toBe(Infinity)
		expect(isMultipleOf(0.3, 0.1)).toBe(true)
		expect(() => isMultipleOf(1, 0)).toThrow(RangeError)
	})
})
