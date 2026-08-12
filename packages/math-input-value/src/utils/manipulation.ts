import { last } from '@step-wise/utils'

import type { ExpressionValue, InputValuePart } from '../types'

import { isTextPart } from './fundamentals'
import { getStartCursor, getEndCursor } from './cursors'

export function getSubExpression<TAdditionalPart = never>(value: (InputValuePart | TAdditionalPart)[], left = getStartCursor(value), right = getEndCursor(value)): (InputValuePart | TAdditionalPart)[] {
	const leftElement = value[left.part]
	const rightElement = value[right.part]
	if (!isTextPart(leftElement) || !isTextPart(rightElement)) throw new Error('getSubExpression cursors must point to text parts')
	if (left.part === right.part) return [leftElement.substring(left.cursor, right.cursor)]
	return [leftElement.substring(left.cursor), ...value.slice(left.part + 1, right.part), rightElement.substring(0, right.cursor)]
}

export function mergeAdjacentTextParts(value: ExpressionValue): ExpressionValue {
	const result: ExpressionValue = []
	value.forEach(part => {
		const previousPart = last(result, true)
		if (isTextPart(part) && isTextPart(previousPart)) result[result.length - 1] = `${previousPart}${part}`
		else result.push(part)
	})
	return result
}
