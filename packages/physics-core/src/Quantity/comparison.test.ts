import { describe, expect, test } from 'vitest'

import { adjustQuantityTolerances, isQuantityEqualityOptionsInput, resolveQuantityEqualityOptions } from './comparison.ts'

describe('Quantity comparison options', () => {
	test('resolves value and unit defaults independently', () => {
		const result = resolveQuantityEqualityOptions({}, 0.1)
		expect(result.value.absoluteTolerance).toBe(0.1)
		expect(result.unit.checkSize).toBe(false)
	})

	test('keeps nested overrides', () => {
		const result = resolveQuantityEqualityOptions({ value: { checkPower: true }, unit: { checkSize: true, target: 'base' } }, 0)
		expect(result.value.checkPower).toBe(true)
		expect(result.unit).toMatchObject({ checkSize: true, target: 'base' })
	})

	test('recognizes Quantity equality option inputs', () => {
		expect(isQuantityEqualityOptionsInput({})).toBe(true)
		expect(isQuantityEqualityOptionsInput({ value: { significantDigitTolerance: 1 }, unit: { target: 'base' } })).toBe(true)
		expect(isQuantityEqualityOptionsInput(undefined)).toBe(false)
		expect(isQuantityEqualityOptionsInput({ value: { significantDigitTolerance: -1 } })).toBe(false)
		expect(isQuantityEqualityOptionsInput({ unit: { target: 'invalid' } })).toBe(false)
		expect(isQuantityEqualityOptionsInput({ value: null })).toBe(false)
		expect(isQuantityEqualityOptionsInput({ extra: true })).toBe(false)
	})

	test('adjusts only numerical tolerances', () => {
		const result = adjustQuantityTolerances({ value: { absoluteTolerance: 2 }, unit: { target: 'base' } }, 1000, 0)
		expect(result.value.absoluteTolerance).toBe(2000)
		expect(result.unit.target).toBe('base')
	})
})
