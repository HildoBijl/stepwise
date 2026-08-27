import { first, last } from '@step-wise/js-utils'

import { type ExpressionTextCursor, type InputValuePart, isTextPart } from '../types'

import { createEmptyExpressionValue } from './fundamentals'

export function areExpressionTextCursorsEqual(a: ExpressionTextCursor, b: ExpressionTextCursor): boolean {
	validateExpressionTextCursor(a)
	validateExpressionTextCursor(b)
	return a.part === b.part && a.cursor === b.cursor
}

export function getExpressionStartCursor<TAdditionalPart = never>(value: (InputValuePart | TAdditionalPart)[] = createEmptyExpressionValue()): ExpressionTextCursor {
	const firstPart = first(value)
	if (!isTextPart(firstPart)) throw new Error(`Could not extract the starting cursor. The received ExpressionInputValue started with ${JSON.stringify(firstPart)} instead of a text part.`)
	return { part: 0, cursor: 0 }
}

export function getExpressionEndCursor<TAdditionalPart = never>(value: (InputValuePart | TAdditionalPart)[] = createEmptyExpressionValue()): ExpressionTextCursor {
	const lastPart = last(value)
	if (!isTextPart(lastPart)) throw new Error(`Could not extract the ending cursor. The received ExpressionInputValue ended with ${JSON.stringify(lastPart)} instead of a text part.`)
	return { part: value.length - 1, cursor: lastPart.length }
}

export function shiftExpressionTextCursorLeft(cursor: ExpressionTextCursor, amount = 1): ExpressionTextCursor {
	validateExpressionTextCursor(cursor)
	validateShiftAmount(amount)
	if (amount > cursor.cursor) throw new Error('Cannot move the expression cursor leftwards beyond the start of the text part.')
	return { ...cursor, cursor: cursor.cursor - amount }
}

export function shiftExpressionTextCursorRight(cursor: ExpressionTextCursor, amount = 1): ExpressionTextCursor {
	validateExpressionTextCursor(cursor)
	validateShiftAmount(amount)
	return { ...cursor, cursor: cursor.cursor + amount }
}

function validateExpressionTextCursor(cursor: ExpressionTextCursor): void {
	if (!Number.isInteger(cursor.part) || cursor.part < 0) throw new RangeError('An expression cursor part index must be a non-negative integer.')
	if (!Number.isInteger(cursor.cursor) || cursor.cursor < 0) throw new RangeError('An expression cursor offset within a text part must be a non-negative integer.')
}

function validateShiftAmount(amount: number): void {
	if (!Number.isInteger(amount) || amount < 0) throw new RangeError('An expression cursor shift amount must be a non-negative integer.')
}
