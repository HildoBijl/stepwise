import { describe, expect, it } from 'vitest'

import { PrecisionNumber } from '@step-wise/physics-core'

import { precisionNumberEqualityAdapter, precisionNumberInputValueAdapter, precisionNumberSerializationAdapter } from './precisionNumber.ts'

describe('PrecisionNumber value type', () => {
	it('converts precision numbers to and from input values', () => {
		const value = new PrecisionNumber('3.140')
		const inputValue = precisionNumberInputValueAdapter.toInputValue(value)
		const restored = precisionNumberInputValueAdapter.interpret(inputValue)

		expect(precisionNumberInputValueAdapter.isInputValue(inputValue)).toBe(true)
		expect(precisionNumberInputValueAdapter.isDomainValue(restored)).toBe(true)
		expect(restored.equals(value)).toBe(true)
	})

	it('serializes and deserializes precision numbers', () => {
		const value = new PrecisionNumber('3.140')
		const serialized = precisionNumberSerializationAdapter.serialize(value)
		const restored = precisionNumberSerializationAdapter.deserialize(serialized)

		expect(precisionNumberSerializationAdapter.isSerializedValue(serialized)).toBe(true)
		expect(restored.toStorageValue()).toEqual(value.toStorageValue())
	})

	it('compares precision numbers with validated equality options', () => {
		const options = { absoluteTolerance: 1, significantDigitTolerance: Infinity }
		expect(precisionNumberEqualityAdapter.isOptions(options)).toBe(true)
		expect(precisionNumberEqualityAdapter.areEqual(new PrecisionNumber('10'), new PrecisionNumber('10'), options)).toBe(true)
		expect(precisionNumberEqualityAdapter.areEqual(new PrecisionNumber('12'), new PrecisionNumber('10'), undefined)).toBe(false)
	})
})
