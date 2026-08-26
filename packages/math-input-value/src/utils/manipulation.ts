import { last } from '@step-wise/js-utils'

import { type ExpressionValue, type ExpressionPosition, type InputValuePart, isTextPart } from '../types'

import { getExpressionStart, getExpressionEnd } from './positions'

export function sliceExpressionValue<TAdditionalPart = never>(value: (InputValuePart | TAdditionalPart)[], left = getExpressionStart(value), right = getExpressionEnd(value)): (InputValuePart | TAdditionalPart)[] {
	const leftElement = getPositionTextPart(value, left, 'left')
	const rightElement = getPositionTextPart(value, right, 'right')
	if (left.part > right.part || (left.part === right.part && left.cursor > right.cursor)) throw new RangeError('The left sliceExpressionValue position cannot come after the right position.')
	if (left.part === right.part) return [leftElement.substring(left.cursor, right.cursor)]
	return [leftElement.substring(left.cursor), ...value.slice(left.part + 1, right.part), rightElement.substring(0, right.cursor)]
}

function getPositionTextPart<TAdditionalPart>(value: (InputValuePart | TAdditionalPart)[], position: ExpressionPosition, name: string): string {
	if (!Number.isInteger(position.part) || position.part < 0 || position.part >= value.length) throw new RangeError(`The ${name} sliceExpressionValue position has an invalid part index.`)
	const part = value[position.part]
	if (!isTextPart(part)) throw new TypeError(`The ${name} sliceExpressionValue position must point to a text part.`)
	if (!Number.isInteger(position.cursor) || position.cursor < 0 || position.cursor > part.length) throw new RangeError(`The ${name} sliceExpressionValue position is outside its text part.`)
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
