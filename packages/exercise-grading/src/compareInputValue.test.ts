import { IntegerType } from '@step-wise/input-interpretation'
import { describe, expect, it } from 'vitest'

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

	it('rejects non-boolean custom results and unknown input types', () => {
		const data = makeCheckInputData({}, {})
		expect(() => compareInputValue(1, 1, { key: 'x', type: IntegerType, comparison: (() => 'yes') as never, data })).toThrow(TypeError)
		expect(() => compareInputValue(1, 1, { key: 'x', type: 'Unknown', data })).toThrow(/Unknown/)
	})
})
