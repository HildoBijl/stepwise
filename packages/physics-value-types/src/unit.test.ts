import { describe, expect, it } from 'vitest'

import { Unit } from '@step-wise/physics-core'

import { unitEqualityAdapter, unitInputValueAdapter, unitSerializationAdapter } from './unit.ts'

describe('Unit value type', () => {
	it('converts units to and from input values', () => {
		const value = new Unit('m/s^2')
		const inputValue = unitInputValueAdapter.toInputValue(value)
		const restored = unitInputValueAdapter.interpret(inputValue)

		expect(unitInputValueAdapter.isInputValue(inputValue)).toBe(true)
		expect(unitInputValueAdapter.isDomainValue(restored)).toBe(true)
		expect(restored.equals(value)).toBe(true)
	})

	it('serializes and deserializes units', () => {
		const value = new Unit('kN*m')
		const serialized = unitSerializationAdapter.serialize(value)
		const restored = unitSerializationAdapter.deserialize(serialized)

		expect(unitSerializationAdapter.isSerializedValue(serialized)).toBe(true)
		expect(restored.toStorageValue()).toEqual(value.toStorageValue())
	})

	it('compares units with validated equality options', () => {
		expect(unitEqualityAdapter.isOptions({ target: 'base', checkSize: false })).toBe(true)
		expect(unitEqualityAdapter.areEqual(new Unit('N'), new Unit('kg*m/s^2'), { target: 'base', checkSize: false })).toBe(true)
		expect(unitEqualityAdapter.areEqual(new Unit('m'), new Unit('s'), undefined)).toBe(false)
	})
})
