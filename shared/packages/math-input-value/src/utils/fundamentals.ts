import { first, isPlainObject } from '@step-wise/utils'

import type { ExpressionInputValue, ExpressionPartInputValue, InputValuePart } from '../types'

// Checks.
export function isExpressionPart(element: unknown): element is ExpressionPartInputValue {
	return isPlainObject(element) && Object.keys(element).length === 2 && element.type === 'ExpressionPart' && typeof element.value === 'string'
}
export function isEmptyExpressionValue(value: InputValuePart[]): boolean {
	if (value.length === 0) throw new Error(`Invalid expression InputValue: it can never be an empty array. There must always be at least one ExpressionPart.`)
	return value.length === 1 && first(value).type === 'ExpressionPart' && first(value).value === ''
}

// Getters of properties.
export function getExpressionPartValue<TExtension = never>(element: ExpressionPartInputValue | TExtension): string {
	if (!isExpressionPart(element)) throw new Error(`Invalid case: tried to find a value of an object that was not an expression part.`)
	return element.value
}

// Getters for objects.
export function getExpressionPartWith(value: string): ExpressionPartInputValue {
	return { type: 'ExpressionPart', value }
}
export function getExpressionValueWith(value: string): ExpressionPartInputValue[] {
	return [getExpressionPartWith(value)]
}
export function getExpressionWith(value: string): ExpressionInputValue {
	return addExpressionType(getExpressionValueWith(value))
}

// Getters for empty objects.
export function getEmptyExpressionPart(): ExpressionPartInputValue {
	return getExpressionPartWith('')
}
export function getEmptyExpressionValue(): ExpressionPartInputValue[] {
	return [getEmptyExpressionPart()]
}
export function getEmptyExpression(): ExpressionInputValue {
	return getExpressionWith('')
}

// Expanding a value to an Expression.
export function addExpressionType(value: InputValuePart[]): ExpressionInputValue {
	return { type: 'Expression', value }
}
