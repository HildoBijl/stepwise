import { first, last } from '@step-wise/js-utils'

import { type ExpressionPosition, type InputValuePart, isTextPart } from '../types'

import { createEmptyExpressionValue } from './fundamentals'

export function areExpressionPositionsEqual(a: ExpressionPosition, b: ExpressionPosition): boolean {
	validateExpressionPosition(a)
	validateExpressionPosition(b)
	return a.part === b.part && a.cursor === b.cursor
}

export function getExpressionStart<TAdditionalPart = never>(value: (InputValuePart | TAdditionalPart)[] = createEmptyExpressionValue()): ExpressionPosition {
	const firstPart = first(value)
	if (!isTextPart(firstPart)) throw new Error(`Could not extract starting cursor position. The received ExpressionInputValue started with ${JSON.stringify(firstPart)} instead of a text part.`)
	return { part: 0, cursor: 0 }
}

export function getExpressionEnd<TAdditionalPart = never>(value: (InputValuePart | TAdditionalPart)[] = createEmptyExpressionValue()): ExpressionPosition {
	const lastPart = last(value)
	if (!isTextPart(lastPart)) throw new Error(`Could not extract ending cursor position. The received ExpressionInputValue ended with ${JSON.stringify(lastPart)} instead of a text part.`)
	return { part: value.length - 1, cursor: lastPart.length }
}

export function shiftExpressionPositionLeft(position: ExpressionPosition, amount = 1): ExpressionPosition {
	validateExpressionPosition(position)
	validateShiftAmount(amount)
	if (amount > position.cursor) throw new Error('Cannot move the expression position leftwards beyond the start of the text part.')
	return { ...position, cursor: position.cursor - amount }
}

export function shiftExpressionPositionRight(position: ExpressionPosition, amount = 1): ExpressionPosition {
	validateExpressionPosition(position)
	validateShiftAmount(amount)
	return { ...position, cursor: position.cursor + amount }
}

function validateExpressionPosition(position: ExpressionPosition): void {
	if (!Number.isInteger(position.part) || position.part < 0) throw new RangeError('An expression position part index must be a non-negative integer.')
	if (!Number.isInteger(position.cursor) || position.cursor < 0) throw new RangeError('An expression position within a text part must be a non-negative integer.')
}

function validateShiftAmount(amount: number): void {
	if (!Number.isInteger(amount) || amount < 0) throw new RangeError('An expression position shift amount must be a non-negative integer.')
}
