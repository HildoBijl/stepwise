import { isInt } from '@step-wise/utils'

import { ExpressionNode, Sign, Integer, Float } from '../nodes'

import { stringToVariable } from './variables'

export type ExpressionNodeInput = ExpressionNode | number | string

// Creation functions for numbers.
export function integer(value: number): ExpressionNode {
	return value < 0 ? new Sign(new Integer(-value), true) : new Integer(value)
}
export function float(value: number): ExpressionNode {
	return value < 0 ? new Sign(new Float(-value), true) : new Float(value)
}

// Turn something representing a basic expression (number or variable) into an ExpressionNode.
export function asExpressionNode(input: ExpressionNodeInput): ExpressionNode {
	if (input instanceof ExpressionNode) return input
	if (typeof input === 'number') return isInt(input) ? integer(input) : float(input)
	if (typeof input === 'string') return stringToVariable(input)
	throw new Error(`Invalid expression node input. Could not interpret "${JSON.stringify(input)}".`)
}
