import { last } from '@step-wise/js-utils'

import { type ExpressionValue, type ExpressionTextCursor, type InputValuePart, isTextPart } from '../types/index.ts'

import { getExpressionStartCursor, getExpressionEndCursor } from './cursors.ts'

export function sliceExpressionValue<TAdditionalPart = never>(value: (InputValuePart | TAdditionalPart)[], left = getExpressionStartCursor(value), right = getExpressionEndCursor(value)): (InputValuePart | TAdditionalPart)[] {
	const leftElement = getCursorTextPart(value, left, 'left')
	const rightElement = getCursorTextPart(value, right, 'right')
	if (left.part > right.part || (left.part === right.part && left.cursor > right.cursor)) throw new RangeError('The left sliceExpressionValue cursor cannot come after the right cursor.')
	if (left.part === right.part) return [leftElement.substring(left.cursor, right.cursor)]
	return [leftElement.substring(left.cursor), ...value.slice(left.part + 1, right.part), rightElement.substring(0, right.cursor)]
}

function getCursorTextPart<TAdditionalPart>(value: (InputValuePart | TAdditionalPart)[], cursor: ExpressionTextCursor, name: string): string {
	if (!Number.isInteger(cursor.part) || cursor.part < 0 || cursor.part >= value.length) throw new RangeError(`The ${name} sliceExpressionValue cursor has an invalid part index.`)
	const part = value[cursor.part]
	if (!isTextPart(part)) throw new TypeError(`The ${name} sliceExpressionValue cursor must point to a text part.`)
	if (!Number.isInteger(cursor.cursor) || cursor.cursor < 0 || cursor.cursor > part.length) throw new RangeError(`The ${name} sliceExpressionValue cursor is outside its text part.`)
	return part
}

export function mergeAdjacentTextParts(value: ExpressionValue): ExpressionValue {
	const result: ExpressionValue = []
	value.forEach(part => {
		const previousPart = last(result, { allowOutOfBounds: true })
		if (isTextPart(part) && isTextPart(previousPart)) result[result.length - 1] = `${previousPart}${part}`
		else result.push(part)
	})
	if (!isTextPart(result[0])) result.unshift('')
	if (!isTextPart(last(result))) result.push('')
	return result
}
