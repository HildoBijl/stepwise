import { isInteger } from '@step-wise/utils'

import { type ExpressionNode, Integer, Float, type NamedConstant, getNamedConstant, Minus } from '../nodes'

// Creation functions for numbers.
export function integer(value: number): Integer | Minus {
	return value < 0 ? new Minus(new Integer(-value)) : new Integer(value)
}
export function float(value: number): Float | Minus {
	return value < 0 ? new Minus(new Float(-value)) : new Float(value)
}
export function namedConstant(symbol: string): NamedConstant {
	return getNamedConstant(symbol)
}
export function number(value: number | string): ExpressionNode {
	if (typeof value === 'string') return namedConstant(value)
	return isInteger(value) ? integer(value) : float(value)
}
