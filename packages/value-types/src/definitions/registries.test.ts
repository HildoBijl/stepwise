import { describe, expect, it } from 'vitest'

import { hasOnlyKeys, isPlainObject, isString } from '@step-wise/js-utils'
import type { SerializationAdapter } from '@step-wise/serialization'
import type { InputValueAdapter } from '@step-wise/input-interpretation'
import type { ValueEqualityAdapter } from '@step-wise/value-equality'

import { combineValueTypes, createAreValuesEqual, extractValueTypeAdapters, extractInputValueAdapters, extractSerializationAdapters, extractValueEqualityAdapters } from './registries.ts'
import type { ValueTypes } from './types.ts'

const ExampleType = 'Example'
type ExampleInputValue = { type: typeof ExampleType, value: string }
type SerializedExample = { type: typeof ExampleType, value: string }

class Example {
	readonly type = ExampleType
	constructor(readonly value: string) {}
}

const serializationAdapter = {
	isDomainValue: (value: unknown): value is Example => value instanceof Example,
	isSerializedValue: (value: unknown): value is SerializedExample => isExampleData(value),
	serialize: value => ({ type: ExampleType, value: value.value }),
	deserialize: value => new Example(value.value),
} satisfies SerializationAdapter<Example, SerializedExample>

const inputValueAdapter = {
	isInputValue: (value: unknown): value is ExampleInputValue => isExampleData(value),
	isDomainValue: (value: unknown): value is Example => value instanceof Example,
	interpret: value => new Example(value.value),
	toInputValue: value => ({ type: ExampleType, value: value.value }),
} satisfies InputValueAdapter<ExampleInputValue, Example>

const equalityAdapter = {
	isValue: (value: unknown): value is Example => value instanceof Example,
	areEqual: (inputValue, expectedValue) => inputValue.value === expectedValue.value,
} satisfies ValueEqualityAdapter<Example>

const completeValueType = {
	inputValue: inputValueAdapter,
	serialization: serializationAdapter,
	equality: equalityAdapter,
}

function isExampleData(value: unknown): value is ExampleInputValue {
	return isPlainObject(value) && hasOnlyKeys(value, ['type', 'value']) && value.type === ExampleType && isString(value.value)
}

describe('value-type registries', () => {
	it('extracts each adapter capability independently', () => {
		const valueTypes = {
			[ExampleType]: completeValueType,
			InputOnly: { inputValue: inputValueAdapter },
			SerializationOnly: { serialization: serializationAdapter },
			EqualityOnly: { equality: equalityAdapter },
		} satisfies ValueTypes

		expect(extractInputValueAdapters(valueTypes)).toEqual({ [ExampleType]: inputValueAdapter, InputOnly: inputValueAdapter })
		expect(extractSerializationAdapters(valueTypes)).toEqual({ [ExampleType]: serializationAdapter, SerializationOnly: serializationAdapter })
		expect(extractValueEqualityAdapters(valueTypes)).toEqual({ [ExampleType]: equalityAdapter, EqualityOnly: equalityAdapter })
		const combinedAdapters = extractValueTypeAdapters(valueTypes)
		expect(combinedAdapters.inputValueAdapters).toEqual(extractInputValueAdapters(valueTypes))
		expect(combinedAdapters.serializationAdapters).toEqual(extractSerializationAdapters(valueTypes))
		expect(combinedAdapters.equalityAdapters).toEqual(extractValueEqualityAdapters(valueTypes))
	})

	it('combines disjoint registries without changing their value types', () => {
		const first = { First: { inputValue: inputValueAdapter } } satisfies ValueTypes
		const second = { Second: { serialization: serializationAdapter } } satisfies ValueTypes
		const combined = combineValueTypes(first, second)

		expect(combined).toEqual({ First: first.First, Second: second.Second })
		expect(combined.First).toBe(first.First)
		expect(combined.Second).toBe(second.Second)
	})

	it('supports empty and partial value types', () => {
		const valueTypes = { Empty: {}, EqualityOnly: { equality: equalityAdapter } } satisfies ValueTypes
		expect(combineValueTypes({}, valueTypes)).toEqual(valueTypes)
		expect(extractInputValueAdapters(valueTypes)).toEqual({})
		expect(extractValueEqualityAdapters(valueTypes)).toEqual({ EqualityOnly: equalityAdapter })
	})

	it('creates a type-keyed equality operation', () => {
		const areValuesEqual = createAreValuesEqual({ [ExampleType]: equalityAdapter })
		expect(areValuesEqual(ExampleType, new Example('a'), new Example('a'))).toBe(true)
		expect(areValuesEqual(ExampleType, new Example('a'), new Example('b'))).toBe(false)
		expect(() => areValuesEqual('Unknown', new Example('a'), new Example('a'))).toThrow(/no equality adapter found/)
	})

	it('rejects duplicate type keys, including identical definitions', () => {
		const valueTypes = { [ExampleType]: completeValueType } satisfies ValueTypes
		expect(() => combineValueTypes(valueTypes, valueTypes)).toThrow(/duplicate type "Example"/)
	})

	it('rejects malformed registries and value-type definitions', () => {
		expect(() => combineValueTypes(null as never)).toThrow(/plain object/)
		expect(() => combineValueTypes({ Example: null } as never)).toThrow(/Invalid value type/)
		expect(() => combineValueTypes({ Example: { unknown: equalityAdapter } } as never)).toThrow(/complete/)
		expect(() => extractSerializationAdapters({ Example: { serialization: null } } as never)).toThrow(/complete/)
	})
})
