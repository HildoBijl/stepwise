import { describe, expect, it } from 'vitest'

import { isString } from '@step-wise/js-utils'

import { isInputValueOfType, interpretInputData, interpretInputValue, toInputValue } from './index.ts'
import type { InputValue, InputValueAdapter, InputValueAdapters } from './types.ts'
const CustomType = 'Custom'
type CustomInputValue = InputValue<typeof CustomType, string>

class CustomValue {
	constructor(readonly value: string) {}
}

const customAdapter = {
	isInputValue: (value: unknown): value is CustomInputValue => isInputValueOfType(value, CustomType, isString),
	isDomainValue: (value: unknown): value is CustomValue => value instanceof CustomValue,
	interpret: inputValue => new CustomValue(inputValue.value),
	toInputValue: domainValue => ({ type: CustomType, value: domainValue.value }),
} satisfies InputValueAdapter<CustomInputValue, CustomValue>

const customInputValueAdapters = { [CustomType]: customAdapter } satisfies InputValueAdapters

describe('custom input-value adapters', () => {
	it('interprets and converts a custom input type', () => {
		expect(interpretInputValue({ type: CustomType, value: 'value' }, customInputValueAdapters)).toEqual(new CustomValue('value'))
		expect(toInputValue(new CustomValue('value'), CustomType, customInputValueAdapters)).toEqual({ type: CustomType, value: 'value' })
	})

	it('uses custom adapters recursively', () => {
		expect(interpretInputData({ first: { type: CustomType, value: 'one' }, nested: { second: { type: CustomType, value: 'two' } } }, customInputValueAdapters)).toEqual({
			first: new CustomValue('one'),
			nested: { second: new CustomValue('two') },
		})
	})

	it('ignores inherited registry entries', () => {
		const inputValueAdapters = Object.create({ [CustomType]: customAdapter }) as InputValueAdapters
		expect(() => interpretInputValue({ type: CustomType, value: 'value' }, inputValueAdapters)).toThrow(/unknown type/)
	})

	it('validates values returned by custom adapters', () => {
		const invalidAdapter = { ...customAdapter, interpret: () => 'invalid' as never }
		expect(() => interpretInputValue({ type: CustomType, value: 'value' }, { [CustomType]: invalidAdapter })).toThrow(/invalid domain value/)
	})
})
