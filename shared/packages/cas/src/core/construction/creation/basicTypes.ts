import { isInt } from '@step-wise/utils'

import { ExpressionNode, Integer, Float } from '../nodes'

import { stringToVariable } from './variables'

export type ExpressionNodeInput = ExpressionNode | number | string

// Turn something representing a basic expression (number or variable) into an ExpressionNode.
export function asExpressionNode(input: ExpressionNodeInput): ExpressionNode {
	if (input instanceof ExpressionNode) return input
	if (typeof input === 'number') return isInt(input) ? new Integer(input) : new Float(input)
	if (typeof input === 'string') return stringToVariable(input)
	throw new Error(`Invalid expression node input. Could not interpret "${JSON.stringify(input)}".`)
}

// Back-up constructors, probably mostly unneeded.
export const integer = (value: number) => new Integer(value)
export const float = (value: number) => new Float(value)
