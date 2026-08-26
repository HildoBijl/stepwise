import { first, last } from '@step-wise/js-utils'

import { type InputCursorEnd, type InputValuePart, isTextPart } from '../types'

import { getEmptyExpressionValue } from './fundamentals'

export function equalCursor(a: InputCursorEnd, b: InputCursorEnd): boolean {
	validateInputCursorEnd(a)
	validateInputCursorEnd(b)
	return a.part === b.part && a.cursor === b.cursor
}

export function getStartCursor<TAdditionalPart = never>(value: (InputValuePart | TAdditionalPart)[] = getEmptyExpressionValue()): InputCursorEnd {
	const firstPart = first(value)
	if (!isTextPart(firstPart)) throw new Error(`Could not extract starting cursor position. The received ExpressionInputValue started with ${JSON.stringify(firstPart)} instead of a text part.`)
	return { part: 0, cursor: 0 }
}

export function getEndCursor<TAdditionalPart = never>(value: (InputValuePart | TAdditionalPart)[] = getEmptyExpressionValue()): InputCursorEnd {
	const lastPart = last(value)
	if (!isTextPart(lastPart)) throw new Error(`Could not extract ending cursor position. The received ExpressionInputValue ended with ${JSON.stringify(lastPart)} instead of a text part.`)
	return { part: value.length - 1, cursor: lastPart.length }
}

export function shiftPositionLeft(position: InputCursorEnd, amount = 1): InputCursorEnd {
	validateInputCursorEnd(position)
	validateShiftAmount(amount)
	if (amount > position.cursor) throw new Error('Cannot move the cursor leftwards beyond the end of the text part.')
	return { ...position, cursor: position.cursor - amount }
}

export function shiftPositionRight(position: InputCursorEnd, amount = 1): InputCursorEnd {
	validateInputCursorEnd(position)
	validateShiftAmount(amount)
	return { ...position, cursor: position.cursor + amount }
}

function validateInputCursorEnd(position: InputCursorEnd): void {
	if (!Number.isInteger(position.part) || position.part < 0) throw new RangeError('A cursor part index must be a non-negative integer.')
	if (!Number.isInteger(position.cursor) || position.cursor < 0) throw new RangeError('A cursor position must be a non-negative integer.')
}

function validateShiftAmount(amount: number): void {
	if (!Number.isInteger(amount) || amount < 0) throw new RangeError('A cursor shift amount must be a non-negative integer.')
}
