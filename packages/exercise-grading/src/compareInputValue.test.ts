import { describe, expect, it } from 'vitest'

import { IntegerType } from '@step-wise/input-interpretation'
import type { ValueEqualityAdapter } from '@step-wise/value-equality'

import { compareInputValue } from './compareInputValue.ts'
import { makeCheckInputData } from './testUtils.ts'

describe('compareInputValue', () => {
	it('uses built-in comparisons with the provided options', () => {
		const data = makeCheckInputData({}, {})
		expect(compareInputValue(11, 10, { key: 'x', type: IntegerType, comparison: { absoluteTolerance: 1 }, data })).toBe(true)
	})

	it('rejects invalid options through the adapter', () => {
		const data = makeCheckInputData({}, {})
		expect(() => compareInputValue(1, 1, { key: 'x', type: IntegerType, comparison: { absoluteTolerance: -1 }, data })).toThrow(/equality options/)
	})

	it('uses custom comparisons', () => {
		const data = makeCheckInputData({}, { x: 20 })
		expect(compareInputValue(10, 20, { key: 'x', type: IntegerType, comparison: inputValue => inputValue === 10, data })).toBe(true)
	})

	it('uses custom equality adapters before built-in adapters', () => {
		const customEquality = {
			isValue: (value: unknown): value is string => typeof value === 'string',
			areEqual: (inputValue, expectedValue) => inputValue.toLowerCase() === expectedValue.toLowerCase(),
		} satisfies ValueEqualityAdapter<string>
		const integerOverride = {
			isValue: (value: unknown): value is number => typeof value === 'number',
			areEqual: () => false,
		} satisfies ValueEqualityAdapter<number>

		const customData = { ...makeCheckInputData({}, {}), equalityAdapters: { Custom: customEquality } }
		expect(compareInputValue('VALUE', 'value', { key: 'x', type: 'Custom', data: customData })).toBe(true)

		const overrideData = { ...makeCheckInputData({}, {}), equalityAdapters: { [IntegerType]: integerOverride } }
		expect(compareInputValue(1, 1, { key: 'x', type: IntegerType, data: overrideData })).toBe(false)
	})
	it('rejects non-boolean custom results and unknown input types', () => {
		const data = makeCheckInputData({}, {})
		expect(() => compareInputValue(1, 1, { key: 'x', type: IntegerType, comparison: (() => 'yes') as never, data })).toThrow(TypeError)
		expect(() => compareInputValue(1, 1, { key: 'x', type: 'Unknown', data })).toThrow(/Unknown/)
	})
})
