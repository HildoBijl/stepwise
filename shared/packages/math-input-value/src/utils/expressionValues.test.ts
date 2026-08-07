import type { AccentInputValue, ExpressionValue } from '../types'

import { equalCursor, getEmptyExpressionValue, getEndCursor, getStartCursor, getSubExpression, isEmptyExpressionValue, mergeAdjacentTextParts, shiftPositionLeft, shiftPositionRight } from './index'

const accent = (value: string): AccentInputValue => ({ type: 'Accent', name: 'dot', value })

describe('expression cursors', () => {
	test('returns the boundaries of an expression value', () => {
		const value: ExpressionValue = ['ab', accent('x'), 'cde']
		expect(getStartCursor(value)).toEqual({ part: 0, cursor: 0 })
		expect(getEndCursor(value)).toEqual({ part: 2, cursor: 3 })
	})

	test('uses an empty expression value by default', () => {
		expect(getStartCursor()).toEqual({ part: 0, cursor: 0 })
		expect(getEndCursor()).toEqual({ part: 0, cursor: 0 })
	})

	test('moves and compares cursor ends', () => {
		const cursor = { part: 2, cursor: 3 }
		expect(shiftPositionLeft(cursor, 2)).toEqual({ part: 2, cursor: 1 })
		expect(shiftPositionRight(cursor, 2)).toEqual({ part: 2, cursor: 5 })
		expect(equalCursor(cursor, { part: 2, cursor: 3 })).toBe(true)
		expect(equalCursor(cursor, { part: 1, cursor: 3 })).toBe(false)
	})

	test('rejects expression values without text boundaries', () => {
		const value = [accent('x')]
		expect(() => getStartCursor(value)).toThrow('instead of a text part')
		expect(() => getEndCursor(value)).toThrow('instead of a text part')
	})
})

describe('expression value manipulation', () => {
	test('extracts text within one expression part', () => {
		expect(getSubExpression(['abcd'], { part: 0, cursor: 1 }, { part: 0, cursor: 3 })).toEqual(['bc'])
	})

	test('extracts text and constructs across expression parts', () => {
		const middle = accent('x')
		expect(getSubExpression(['ab', middle, 'cd'], { part: 0, cursor: 1 }, { part: 2, cursor: 1 })).toEqual(['b', middle, 'c'])
	})

	test('uses the full expression when cursors are omitted', () => {
		const value: ExpressionValue = ['a', accent('x'), 'b']
		expect(getSubExpression(value)).toEqual(value)
	})

	test('merges adjacent text parts', () => {
		const middle = accent('x')
		expect(mergeAdjacentTextParts(['a', 'b', middle, 'c', 'd'])).toEqual(['ab', middle, 'cd'])
	})
})

describe('empty expression values', () => {
	test('recognizes the canonical empty expression value', () => {
		expect(getEmptyExpressionValue()).toEqual([''])
		expect(isEmptyExpressionValue([''])).toBe(true)
		expect(isEmptyExpressionValue(['x'])).toBe(false)
	})

	test('rejects an empty value array', () => {
		expect(() => isEmptyExpressionValue([])).toThrow('can never be an empty array')
	})
})
