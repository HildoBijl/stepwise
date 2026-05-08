import { isInt } from '@step-wise/utils'

import { ExpressionNode, Sign, Integer, Float } from '../nodes'

// Creation functions for numbers.
export function integer(value: number): ExpressionNode {
	return value < 0 ? new Sign(new Integer(-value), true) : new Integer(value)
}
export function float(value: number): ExpressionNode {
	return value < 0 ? new Sign(new Float(-value), true) : new Float(value)
}
export function number(value: number): ExpressionNode {
	return isInt(value) ? integer(value) : float(value)
}
