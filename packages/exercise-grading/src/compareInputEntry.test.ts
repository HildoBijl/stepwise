import { describe, expect, it } from 'vitest'

import { type ValueEqualityAdapter, areValuesEqual } from '@step-wise/value-equality'
import { IntegerType } from '@step-wise/value-types'

import { compareInputEntry } from './compareInputEntry.ts'
import { makeCheckInputData } from './testUtils.ts'

describe('compareInputEntry', () => {
	it('uses equality comparisons with the provided options', () => {
		const data = makeCheckInputData({ x: { type: IntegerType, value: '11' } }, { x: 10 }, { x: { absoluteTolerance: 1 } })
		expect(compareInputEntry('x', 'x', data)).toBe(true)
	})

	it('rejects invalid options through the adapter', () => {
		const data = makeCheckInputData({ x: { type: IntegerType, value: '1' } }, { x: 1 }, { x: { absoluteTolerance: -1 } })
		expect(() => compareInputEntry('x', 'x', data)).toThrow(/equality options/)
	})

	it('uses custom comparisons', () => {
		const data = makeCheckInputData({ x: { type: IntegerType, value: '10' } }, { x: 20 }, { x: inputValue => inputValue === 10 })
		expect(compareInputEntry('x', 'x', data)).toBe(true)
	})

	it('uses the supplied equality operation', () => {
		const customEquality = {
			isValue: (value: unknown): value is string => typeof value === 'string',
			areEqual: (inputValue, expectedValue) => inputValue.toLowerCase() === expectedValue.toLowerCase(),
		} satisfies ValueEqualityAdapter<string>
		const integerOverride = {
			isValue: (value: unknown): value is number => typeof value === 'number',
			areEqual: () => false,
		} satisfies ValueEqualityAdapter<number>

		const customData = {
			metadata: {}, parameters: {},
			rawInput: { x: { type: 'Custom', value: 'VALUE' } }, input: { x: 'VALUE' }, solution: { x: 'value' },
			areValuesEqual: (type: string, inputValue: unknown, expectedValue: unknown, options?: unknown) => {
				if (type !== 'Custom') throw new Error(`Unknown value type: ${type}`)
				return areValuesEqual(customEquality, inputValue, expectedValue, options)
			},
		}
		expect(compareInputEntry('x', 'x', customData)).toBe(true)

		const overrideData = {
			...makeCheckInputData({ x: { type: IntegerType, value: '1' } }, { x: 1 }),
			areValuesEqual: (_type: string, inputValue: unknown, expectedValue: unknown, options?: unknown) => areValuesEqual(integerOverride, inputValue, expectedValue, options),
		}
		expect(compareInputEntry('x', 'x', overrideData)).toBe(false)
	})

	it('rejects non-boolean custom results and unknown input types', () => {
		const invalidComparison = makeCheckInputData({ x: { type: IntegerType, value: '1' } }, { x: 1 }, { x: (() => 'yes') as never })
		expect(() => compareInputEntry('x', 'x', invalidComparison)).toThrow(TypeError)
		const unknownData = {
			metadata: {}, parameters: {},
			rawInput: { x: { type: 'Unknown', value: 1 } }, input: { x: 1 }, solution: { x: 1 },
			areValuesEqual: (type: string) => { throw new Error(`Unknown value type: ${type}`) },
		}
		expect(() => compareInputEntry('x', 'x', unknownData)).toThrow(/Unknown/)
	})
})
