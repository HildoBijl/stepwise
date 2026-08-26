import type { AccentInputValue, ExpressionValue } from '../types'

import { areExpressionPositionsEqual, createEmptyExpressionValue, getExpressionEnd, getExpressionStart, sliceExpressionValue, isEmptyExpressionValue, mergeAdjacentTextParts, shiftExpressionPositionLeft, shiftExpressionPositionRight } from './index'

const accent = (value: string): AccentInputValue => ({ type: 'Accent', name: 'dot', value })

describe('expression cursors', () => {
	test('returns the boundaries of an expression value', () => {
		const value: ExpressionValue = ['ab', accent('x'), 'cde']
		expect(getExpressionStart(value)).toEqual({ part: 0, cursor: 0 })
		expect(getExpressionEnd(value)).toEqual({ part: 2, cursor: 3 })
	})

	test('uses an empty expression value by default', () => {
		expect(getExpressionStart()).toEqual({ part: 0, cursor: 0 })
		expect(getExpressionEnd()).toEqual({ part: 0, cursor: 0 })
	})

	test('moves and compares cursor ends', () => {
		const cursor = { part: 2, cursor: 3 }
		expect(shiftExpressionPositionLeft(cursor, 2)).toEqual({ part: 2, cursor: 1 })
		expect(shiftExpressionPositionRight(cursor, 2)).toEqual({ part: 2, cursor: 5 })
		expect(areExpressionPositionsEqual(cursor, { part: 2, cursor: 3 })).toBe(true)
		expect(areExpressionPositionsEqual(cursor, { part: 1, cursor: 3 })).toBe(false)
	})

	test('rejects expression values without text boundaries', () => {
		const value = [accent('x')]
		expect(() => getExpressionStart(value)).toThrow('instead of a text part')
		expect(() => getExpressionEnd(value)).toThrow('instead of a text part')
	})
})

describe('expression value manipulation', () => {
	test('extracts text within one expression part', () => {
		expect(sliceExpressionValue(['abcd'], { part: 0, cursor: 1 }, { part: 0, cursor: 3 })).toEqual(['bc'])
	})

	test('extracts text and constructs across expression parts', () => {
		const middle = accent('x')
		expect(sliceExpressionValue(['ab', middle, 'cd'], { part: 0, cursor: 1 }, { part: 2, cursor: 1 })).toEqual(['b', middle, 'c'])
	})

	test('uses the full expression when cursors are omitted', () => {
		const value: ExpressionValue = ['a', accent('x'), 'b']
		expect(sliceExpressionValue(value)).toEqual(value)
	})

	test('merges adjacent text parts', () => {
		const middle = accent('x')
		expect(mergeAdjacentTextParts(['a', 'b', middle, 'c', 'd'])).toEqual(['ab', middle, 'cd'])
	})
})

describe('empty expression values', () => {
	test('recognizes the canonical empty expression value', () => {
		expect(createEmptyExpressionValue()).toEqual([''])
		expect(isEmptyExpressionValue([''])).toBe(true)
		expect(isEmptyExpressionValue(['x'])).toBe(false)
	})

	test('rejects an empty value array', () => {
		expect(() => isEmptyExpressionValue([])).toThrow('can never be an empty array')
	})
})
