import { last } from '@step-wise/js-utils'

import { type ExpressionValue, type InputCursorEnd, type InputValuePart, isTextPart } from '../types'

import { getStartCursor, getEndCursor } from './cursors'

export function getSubExpression<TAdditionalPart = never>(value: (InputValuePart | TAdditionalPart)[], left = getStartCursor(value), right = getEndCursor(value)): (InputValuePart | TAdditionalPart)[] {
	const leftElement = getCursorTextPart(value, left, 'left')
	const rightElement = getCursorTextPart(value, right, 'right')
	if (left.part > right.part || (left.part === right.part && left.cursor > right.cursor)) throw new RangeError('The left getSubExpression cursor cannot come after the right cursor.')
	if (left.part === right.part) return [leftElement.substring(left.cursor, right.cursor)]
	return [leftElement.substring(left.cursor), ...value.slice(left.part + 1, right.part), rightElement.substring(0, right.cursor)]
}

function getCursorTextPart<TAdditionalPart>(value: (InputValuePart | TAdditionalPart)[], position: InputCursorEnd, name: string): string {
	if (!Number.isInteger(position.part) || position.part < 0 || position.part >= value.length) throw new RangeError(`The ${name} getSubExpression cursor has an invalid part index.`)
	const part = value[position.part]
	if (!isTextPart(part)) throw new TypeError(`The ${name} getSubExpression cursor must point to a text part.`)
	if (!Number.isInteger(position.cursor) || position.cursor < 0 || position.cursor > part.length) throw new RangeError(`The ${name} getSubExpression cursor is outside its text part.`)
	return part
}

export function mergeAdjacentTextParts(value: ExpressionValue): ExpressionValue {
	const result: ExpressionValue = []
	value.forEach(part => {
		const previousPart = last(result, { allowOutOfBounds: true })
		if (isTextPart(part) && isTextPart(previousPart)) result[result.length - 1] = `${previousPart}${part}`
		else result.push(part)
	})
	return result
}
