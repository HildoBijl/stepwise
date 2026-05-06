import { first, last } from '@step-wise/utils'

import type { InputCursorEnd, InputValuePart } from '../types'

import { isExpressionPart, getEmptyExpressionValue } from './fundamentals'

export function sameCursor(a: InputCursorEnd, b: InputCursorEnd): boolean {
	return a.part === b.part && a.cursor === b.cursor
}

export function getStartCursor<T = never>(value: (InputValuePart | T)[] = getEmptyExpressionValue()): InputCursorEnd {
	const firstPart = first(value)
	if (!isExpressionPart(firstPart)) throw new Error(`Could not extract starting cursor position of non-InputValuePart parameter "${JSON.stringify(firstPart)}".`)
	return { part: 0, cursor: 0 }
}

export function getEndCursor<T = never>(value: (InputValuePart | T)[] = getEmptyExpressionValue()): InputCursorEnd {
	const lastPart = last(value)
	if (!isExpressionPart(lastPart)) throw new Error(`Could not extract ending cursor position of non-InputValuePart parameter "${JSON.stringify(lastPart)}".`)
	return { part: value.length - 1, cursor: lastPart.value.length }
}

export function moveLeft(position: InputCursorEnd, amount = 1): InputCursorEnd {
	if (amount > position.cursor) throw new Error('Cannot move the cursor leftwards beyond the end of the expression part.')
	return { ...position, cursor: position.cursor - amount }
}

export function moveRight(position: InputCursorEnd, amount = 1): InputCursorEnd {
	return { ...position, cursor: position.cursor + amount }
}
