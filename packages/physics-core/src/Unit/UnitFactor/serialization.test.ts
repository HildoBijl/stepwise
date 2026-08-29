import { describe, expect, test } from 'vitest'

import { isUnitFactorStorageValue } from './serialization.ts'

describe('isUnitFactorStorageValue', () => {
	test('accepts valid UnitFactor storage values', () => {
		expect(isUnitFactorStorageValue({ unit: 'm' })).toBe(true)
		expect(isUnitFactorStorageValue({ prefix: 'k', unit: 'm', power: 2 })).toBe(true)
	})

	test('rejects malformed UnitFactor storage values', () => {
		expect(isUnitFactorStorageValue({ unit: '' })).toBe(false)
		expect(isUnitFactorStorageValue({ unit: 'm', power: 0 })).toBe(false)
		expect(isUnitFactorStorageValue({ unit: 'm', power: 1.5 })).toBe(false)
		expect(isUnitFactorStorageValue({ unit: 'm', extra: true })).toBe(false)
		expect(isUnitFactorStorageValue({ prefix: 1, unit: 'm' })).toBe(false)
	})
})
