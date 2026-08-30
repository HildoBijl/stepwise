import { describe, expect, it } from 'vitest'

import { Quantity } from '@step-wise/physics-core'

import { quantityEqualityAdapter, quantityInputValueAdapter, quantitySerializationAdapter } from './quantity.ts'

describe('Quantity value type', () => {
	it('converts quantities to and from input values', () => {
		const value = new Quantity('9.81 m/s^2')
		const inputValue = quantityInputValueAdapter.toInputValue(value)
		const restored = quantityInputValueAdapter.interpret(inputValue)

		expect(quantityInputValueAdapter.isInputValue(inputValue)).toBe(true)
		expect(quantityInputValueAdapter.isDomainValue(restored)).toBe(true)
		expect(restored.equals(value)).toBe(true)
	})

	it('serializes and deserializes quantities', () => {
		const value = new Quantity('3.140 kN')
		const serialized = quantitySerializationAdapter.serialize(value)
		const restored = quantitySerializationAdapter.deserialize(serialized)

		expect(quantitySerializationAdapter.isSerializedValue(serialized)).toBe(true)
		expect(restored.toStorageValue()).toEqual(value.toStorageValue())
	})

	it('compares quantities with validated equality options', () => {
		const options = { value: { absoluteTolerance: 0.01 }, unit: { target: 'base' as const } }
		expect(quantityEqualityAdapter.isOptions(options)).toBe(true)
		expect(quantityEqualityAdapter.areEqual(new Quantity('100 cm'), new Quantity('1 m'), options)).toBe(true)
		expect(quantityEqualityAdapter.areEqual(new Quantity('2 m'), new Quantity('1 m'), undefined)).toBe(false)
	})
})
