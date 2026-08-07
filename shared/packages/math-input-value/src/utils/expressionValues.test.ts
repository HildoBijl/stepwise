import type { InputValuePart } from '../types'

import { equalCursor, getEmptyExpressionValue, getEndCursor, getStartCursor, getSubExpression, isEmptyExpressionValue, mergeAdjacentExpressionParts, moveLeft, moveRight } from './index'

const text = (value: string) => ({ type: 'ExpressionPart', value }) as const
const accent = (value: string): InputValuePart => ({ type: 'Accent', name: 'dot', value })

describe('expression cursors', () => {
	test('returns the boundaries of an expression value', () => {
		const value = [text('ab'), accent('x'), text('cde')]
		expect(getStartCursor(value)).toEqual({ part: 0, cursor: 0 })
		expect(getEndCursor(value)).toEqual({ part: 2, cursor: 3 })
	})

	test('uses an empty expression value by default', () => {
		expect(getStartCursor()).toEqual({ part: 0, cursor: 0 })
		expect(getEndCursor()).toEqual({ part: 0, cursor: 0 })
	})

	test('moves and compares cursor ends', () => {
		const cursor = { part: 2, cursor: 3 }
		expect(moveLeft(cursor, 2)).toEqual({ part: 2, cursor: 1 })
		expect(moveRight(cursor, 2)).toEqual({ part: 2, cursor: 5 })
		expect(equalCursor(cursor, { part: 2, cursor: 3 })).toBe(true)
		expect(equalCursor(cursor, { part: 1, cursor: 3 })).toBe(false)
	})

	test('rejects expression values without text boundaries', () => {
		const value = [accent('x')]
		expect(() => getStartCursor(value)).toThrow('not an ExpressionPart')
		expect(() => getEndCursor(value)).toThrow('non-InputValuePart')
	})
})

describe('expression value manipulation', () => {
	test('extracts text within one expression part', () => {
		expect(getSubExpression([text('abcd')], { part: 0, cursor: 1 }, { part: 0, cursor: 3 })).toEqual([text('bc')])
	})

	test('extracts text and constructs across expression parts', () => {
		const middle = accent('x')
		expect(getSubExpression([text('ab'), middle, text('cd')], { part: 0, cursor: 1 }, { part: 2, cursor: 1 })).toEqual([
			text('b'), middle, text('c'),
		])
	})

	test('uses the full expression when cursors are omitted', () => {
		const value = [text('a'), accent('x'), text('b')]
		expect(getSubExpression(value)).toEqual(value)
	})

	test('merges adjacent expression parts', () => {
		const middle = accent('x')
		expect(mergeAdjacentExpressionParts([text('a'), text('b'), middle, text('c'), text('d')])).toEqual([
			text('ab'), middle, text('cd'),
		])
	})
})

describe('empty expression values', () => {
	test('recognizes the canonical empty expression value', () => {
		expect(getEmptyExpressionValue()).toEqual([text('')])
		expect(isEmptyExpressionValue([text('')])).toBe(true)
		expect(isEmptyExpressionValue([text('x')])).toBe(false)
	})

	test('rejects an empty value array', () => {
		expect(() => isEmptyExpressionValue([])).toThrow('can never be an empty array')
	})
})
