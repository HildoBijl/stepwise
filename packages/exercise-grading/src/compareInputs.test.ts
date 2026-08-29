import { IntegerType } from '@step-wise/input-interpretation'
import { describe, expect, it, vi } from 'vitest'

import { compareInputs } from './compareInputs.ts'
import { makeCheckInputData } from './testUtils.ts'

describe('compareInputs', () => {
	it('compares one or multiple inputs with their expected values', () => {
		expect(compareInputs('x', makeCheckInputData({ x: { type: IntegerType, value: '12' } }, { x: 12 }))).toBe(true)
		expect(compareInputs('x', makeCheckInputData({ x: { type: IntegerType, value: '13' } }, { x: 12 }))).toBe(false)
		expect(compareInputs(['x', 'y'], makeCheckInputData({ x: { type: IntegerType, value: '1' }, y: { type: IntegerType, value: '2' } }, { x: 1, y: 2 }))).toBe(true)
	})

	it('uses type comparisons and gives input-specific comparisons precedence', () => {
		const rawInput = { x: { type: IntegerType, value: '11' } } as const
		expect(compareInputs('x', makeCheckInputData(rawInput, { x: 10 }, { [IntegerType]: { absoluteTolerance: 1 } }))).toBe(true)
		expect(compareInputs('x', makeCheckInputData(rawInput, { x: 10 }, { [IntegerType]: { absoluteTolerance: 1 }, x: {} }))).toBe(false)
	})

	it('supports custom comparison functions and passes the full context', () => {
		const comparison = vi.fn((inputValue, expectedValue, solution, data) => inputValue * 2 === expectedValue && solution === data.solution)
		const data = makeCheckInputData({ x: { type: IntegerType, value: '10' } }, { x: 20 }, { x: comparison })
		expect(compareInputs('x', data)).toBe(true)
		expect(comparison).toHaveBeenCalledWith(10, 20, data.solution, data)
	})

	it('validates comparison metadata and custom comparison results', () => {
		const rawInput = { x: { type: IntegerType, value: '1' } } as const
		expect(() => compareInputs('x', { ...makeCheckInputData(rawInput, { x: 1 }), metadata: { comparisons: [] } } as never)).toThrow(TypeError)
		expect(() => compareInputs('x', { ...makeCheckInputData(rawInput, { x: 1 }), metadata: { comparisons: { x: {}, unused: 1 } } } as never)).toThrow(TypeError)
		expect(() => compareInputs('x', makeCheckInputData(rawInput, { x: 1 }, { x: (() => 'yes') as never }))).toThrow(TypeError)
	})

	it('validates every key before comparing', () => {
		const data = makeCheckInputData({ x: { type: IntegerType, value: '1' } }, { x: 2 })
		expect(() => compareInputs(['x', 'missing'], data)).toThrow(/missing/)
	})

	it('rejects empty key lists and missing data', () => {
		expect(() => compareInputs([], makeCheckInputData({}, {}))).toThrow(RangeError)
		expect(() => compareInputs('x', makeCheckInputData({ x: { type: IntegerType, value: '1' } }, undefined))).toThrow(/no solution/)
		expect(() => compareInputs('missing', makeCheckInputData({}, { missing: 1 }))).toThrow(/missing/)
		expect(() => compareInputs('missing', makeCheckInputData({ missing: { type: IntegerType, value: '1' } }, {}))).toThrow(/missing/)
	})
})
