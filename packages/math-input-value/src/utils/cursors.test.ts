import { describe, expect, it } from 'vitest'

import type { AccentInputValue, ExpressionValue } from '../types'

import { areExpressionTextCursorsEqual, getExpressionEndCursor, getExpressionStartCursor, shiftExpressionTextCursorLeft, shiftExpressionTextCursorRight } from './cursors'

const accent: AccentInputValue = { type: 'Accent', name: 'dot', value: 'x' }

describe('expression cursors', () => {
	it('returns expression boundaries and empty defaults', () => {
		const value: ExpressionValue = ['ab', accent, 'cde']
		expect(getExpressionStartCursor(value)).toEqual({ part: 0, cursor: 0 })
		expect(getExpressionEndCursor(value)).toEqual({ part: 2, cursor: 3 })
		expect(getExpressionStartCursor()).toEqual({ part: 0, cursor: 0 })
		expect(getExpressionEndCursor()).toEqual({ part: 0, cursor: 0 })
	})

	it('compares and shifts cursors without mutating them', () => {
		const cursor = { part: 2, cursor: 3 }
		expect(areExpressionTextCursorsEqual(cursor, { part: 2, cursor: 3 })).toBe(true)
		expect(areExpressionTextCursorsEqual(cursor, { part: 1, cursor: 3 })).toBe(false)
		expect(shiftExpressionTextCursorLeft(cursor, 2)).toEqual({ part: 2, cursor: 1 })
		expect(shiftExpressionTextCursorRight(cursor, 2)).toEqual({ part: 2, cursor: 5 })
		expect(shiftExpressionTextCursorRight(cursor, 0)).toEqual(cursor)
		expect(cursor).toEqual({ part: 2, cursor: 3 })
	})

	it.each([-1, 1.5, Number.NaN])('rejects invalid shift amount %s', amount => {
		expect(() => shiftExpressionTextCursorRight({ part: 0, cursor: 0 }, amount)).toThrow(RangeError)
	})

	it.each([{ part: -1, cursor: 0 }, { part: 0.5, cursor: 0 }, { part: 0, cursor: -1 }, { part: 0, cursor: 0.5 }])('rejects invalid cursor %#', cursor => {
		expect(() => shiftExpressionTextCursorRight(cursor)).toThrow(RangeError)
	})

	it('prevents shifting left beyond the text-part start', () => {
		expect(() => shiftExpressionTextCursorLeft({ part: 0, cursor: 1 }, 2)).toThrow('beyond the start')
	})

	it('rejects values without text boundaries', () => {
		expect(() => getExpressionStartCursor([accent])).toThrow('instead of a text part')
		expect(() => getExpressionEndCursor([accent])).toThrow('instead of a text part')
	})
})
