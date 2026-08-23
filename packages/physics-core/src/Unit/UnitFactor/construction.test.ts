import { describe, expect, test } from 'vitest'

import { Prefix } from '../Prefix'
import { UnitDefinition } from '../UnitDefinition'

import { ensureUnitFactorStorageValue, isUnitFactorParameters, unitFactorInputToParameters, unitFactorStorageValueToParameters } from './construction'

describe('UnitFactor construction', () => {
	test('validates and resolves storage values', () => {
		expect(ensureUnitFactorStorageValue({ prefix: 'k', unit: 'm', power: 2 })).toEqual({ prefix: 'k', unit: 'm', power: 2 })
		const result = unitFactorStorageValueToParameters({ prefix: 'k', unit: 'm', power: 2 })
		expect(result.prefix?.symbol).toBe('k')
		expect(result.unit.symbol).toBe('m')
		expect(result.power).toBe(2)
	})

	test('recognizes complete parameter objects', () => {
		const input = { prefix: new Prefix({ symbol: 'x', name: 'prefix', exponent: 1 }), unit: new UnitDefinition({ symbol: 'u', name: 'unit', standard: true, base: true }), power: 2 }
		expect(isUnitFactorParameters(input)).toBe(true)
		expect(unitFactorInputToParameters(input)).toBe(input)
	})

	test('rejects malformed and unknown storage values', () => {
		expect(() => ensureUnitFactorStorageValue({ unit: 'm', extra: true })).toThrow(TypeError)
		expect(() => ensureUnitFactorStorageValue({ unit: 'm', power: 0 })).toThrow(/zero/)
		expect(() => unitFactorStorageValueToParameters({ prefix: 'unknown', unit: 'm' })).toThrow(/Unknown prefix/)
		expect(() => unitFactorStorageValueToParameters({ unit: 'unknown' })).toThrow(/Unknown unit/)
	})
})
