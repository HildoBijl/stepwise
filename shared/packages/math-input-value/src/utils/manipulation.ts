import { last } from '@step-wise/utils'

import type { InputValuePart } from '../types'

import { isExpressionPart } from './fundamentals'
import { getStartCursor, getEndCursor } from './cursors'

// Take an expression and extract a part from one cursor to another.
export function getSubExpression<T = never>(value: (InputValuePart | T)[], left = getStartCursor(value), right = getEndCursor(value)): (InputValuePart | T)[] {
	const leftElement = value[left.part]
	const rightElement = value[right.part]
	if (!isExpressionPart(leftElement) || !isExpressionPart(rightElement)) throw new Error('getSubExpression cursors must point to ExpressionPart elements')

	// When the cursors are in the same element, extract the respective part.
	if (left.part === right.part) return [{ ...leftElement, value: leftElement.value.substring(left.cursor, right.cursor) }]

	// Extract the respective parts from the two elements, and add everything in-between.
	return [
		{ type: 'ExpressionPart', value: leftElement.value.substring(left.cursor) },
		...value.slice(left.part + 1, right.part),
		{ type: 'ExpressionPart', value: rightElement.value.substring(0, right.cursor) },
	]
}

// Clean-up function that merges adjacent ExpressionParts within a list of InputValueParts.
export function mergeAdjacentExpressionParts(value: InputValuePart[]): InputValuePart[] {
	const result: InputValuePart[] = []
	value.forEach(part => {
		const previousPart = last(result, true)
		if (isExpressionPart(part) && isExpressionPart(previousPart)) result[result.length - 1] = { ...previousPart, value: `${previousPart.value}${part.value}` }
		else result.push(part)
	})
	return result
}
