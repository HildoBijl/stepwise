import { ExpressionNode } from '../nodes'

import { number } from './numbers'
import { parseVariable } from './variables'

export type ExpressionNodeInput = ExpressionNode | number | string

// Turn something representing a basic expression (number or variable) into an ExpressionNode.
export function asExpressionNode(input: ExpressionNodeInput): ExpressionNode {
	if (input instanceof ExpressionNode) return input
	if (typeof input === 'number') return number(input)
	if (typeof input === 'string') return parseVariable(input)
	throw new Error(`Invalid expression node input. Could not interpret "${JSON.stringify(input)}".`)
}
