import { first, last, isPlainObject } from '@step-wise/utils'

import type { InputCursorEnd, ExpressionInputValue, ExpressionPartInputValue, InputValuePart } from '../types'

export function getEmpty(): ExpressionPartInputValue[] {
	return [{ type: 'ExpressionPart', value: '' }]
}

export function isEmpty(expression: InputValuePart[]): boolean {
	if (expression.length === 0) throw new Error(`Invalid expression InputValue: it can never be an empty array. There must always be at least one ExpressionPart.`)
	const firstElement = first(expression)
	return expression.length === 1 && firstElement.type === 'ExpressionPart' && firstElement.value === ''
}

export function getStartCursor<T = never>(value: (InputValuePart | T)[] = getEmpty()): InputCursorEnd {
	const firstPart = first(value)
	if (!isExpressionPart(firstPart)) throw new Error(`Could not extract starting cursor position of non-InputValuePart parameter "${JSON.stringify(firstPart)}".`)
	return { part: 0, cursor: 0 }
}

export function getEndCursor<T = never>(value: (InputValuePart | T)[] = getEmpty()): InputCursorEnd {
	const lastPart = last(value)
	if (!isExpressionPart(lastPart)) throw new Error(`Could not extract ending cursor position of non-InputValuePart parameter "${JSON.stringify(lastPart)}".`)
	return { part: value.length - 1, cursor: lastPart.value.length }
}

// Take an expression and extract a part from one cursor to another.
export function getSubExpression<T = never>(value: (InputValuePart | T)[], left = getStartCursor(value), right = getEndCursor(value)): (InputValuePart | T)[] {
	const leftElement = value[left.part]
	const rightElement = value[right.part]
	if (!isExpressionPart(leftElement) || !isExpressionPart(rightElement)) throw new Error('getSubExpression cursors must point to ExpressionPart elements')

	// When the cursors are in the same element, extract the respective part.
	if (left.part === right.part) {
		return [{ ...leftElement, value: leftElement.value.substring(left.cursor, right.cursor) }]
	}

	// Extract the respective parts from the two elements, and add everything in-between.
	return [
		{ type: 'ExpressionPart', value: leftElement.value.substring(left.cursor) },
		...value.slice(left.part + 1, right.part),
		{ type: 'ExpressionPart', value: rightElement.value.substring(0, right.cursor) },
	]
}

export function isExpressionPart(element: unknown): element is ExpressionPartInputValue {
	return isPlainObject(element) && Object.keys(element).length === 2 && element.type === 'ExpressionPart' && typeof element.value === 'string'
}

export function moveLeft(position: InputCursorEnd, amount = 1): InputCursorEnd {
	if (amount > position.cursor) throw new Error('Cannot move the cursor leftwards beyond the end of the expression part.')
	return { ...position, cursor: position.cursor - amount }
}

export function moveRight(position: InputCursorEnd, amount = 1): InputCursorEnd {
	return { ...position, cursor: position.cursor + amount }
}

// Clean-up function that turns two adjacent ExpressionParts within a list of InputValueParts into a single one.
export function mergeAdjacentExpressionParts(value: InputValuePart[]): InputValuePart[] {
	const result: InputValuePart[] = []
	value.forEach(part => {
		const previousPart = last(result, true)
		if (part.type === 'ExpressionPart' && previousPart?.type === 'ExpressionPart') result[result.length - 1] = { ...previousPart, value: `${previousPart.value}${part.value}` }
		else result.push(part)
	})
	return result
}

export function addExpressionType(value: InputValuePart[]): ExpressionInputValue {
	return { type: 'Expression', value }
}

export function getExpressionWithValue(value: string): ExpressionInputValue {
	return addExpressionType([{ type: 'ExpressionPart', value }])
}

export function getEmptyExpression(): ExpressionInputValue {
	return getExpressionWithValue('')
}
