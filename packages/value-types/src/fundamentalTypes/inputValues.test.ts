import { describe, expect, it } from 'vitest'

import { integerInputValueAdapter } from './integer/inputValue.ts'
import { multipleChoiceInputValueAdapter } from './multipleChoice/inputValue.ts'

describe('integer adapter', () => {
	it.each([['0', 0], ['42', 42], ['-7', -7], [' 3 ', 3]])('interprets "%s"', (value, expected) => {
		expect(integerInputValueAdapter.interpret({ type: 'Integer', value })).toBe(expected)
	})

	it.each(['', '-', '2.5', 'text', String(Number.MAX_SAFE_INTEGER + 1)])('rejects "%s"', value => {
		expect(() => integerInputValueAdapter.interpret({ type: 'Integer', value })).toThrow()
	})

	it('converts integers to input values', () => {
		expect(integerInputValueAdapter.toInputValue(-7)).toEqual({ type: 'Integer', value: '-7' })
	})
})

describe('multiple-choice adapter', () => {
	it.each([[2, 2], [[2, 4, 1], [2, 4, 1]], [[], []]])('interprets a selection', (value, expected) => {
		expect(multipleChoiceInputValueAdapter.interpret({ type: 'MultipleChoice', value })).toEqual(expected)
	})

	it.each([-1, 1.5, Number.MAX_SAFE_INTEGER + 1, '1', [1, 1]])('rejects an invalid selection', value => {
		expect(() => multipleChoiceInputValueAdapter.interpret({ type: 'MultipleChoice', value } as never)).toThrow()
	})
})
