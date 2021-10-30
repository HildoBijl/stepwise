// The Expression class represents any type of mathematical expression, including with brackets, fractions, functions, variables with subscripts, powers and more. It does NOT include an equals sign or other form of comparison: that would make it an equation or inequality.

import { isObject, deepEquals } from '../../util/objects'
import { firstOf } from '../../util/arrays'

import { Expression, Integer, Float, Variable, Sum, Product, Fraction, Power, Ln } from './loader'
import { interpretExpressionValue } from './interpreter/expressions'

export default Expression
export const bracketLevels = Expression.bracketLevels
export const simplifyOptions = Expression.simplifyOptions
export const equalityLevels = Expression.equalityLevels

export function getExpressionTypes() {
	return {
		Integer,
		Float,
		Variable,
		Sum,
		Product,
		Fraction,
		Power,
		Ln,
	}
}

// The following functions are obligatory functions.
export function isFOofType(expression) {
	return isObject(expression) && expression.constructor === Expression
}

export function FOtoIO(expression) {
	expression = Expression.ensureExpression(expression)

	// Assemble the input object.
	return getEmpty() // TODO
}

export function IOtoFO(expression) {
	return interpretExpressionValue(expression)
}

export function getEmpty() {
	return [{ type: 'ExpressionPart', value: '' }]
}

export function isEmpty(expression) {
	const firstElement = firstOf(expression)
	return expression.length === 1 && firstElement && firstElement.value === ''
}

export function equals(a, b) {
	return deepEquals(a, b)
}
