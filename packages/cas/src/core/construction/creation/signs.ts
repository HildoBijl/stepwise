import { type SignNode, Minus, PlusMinus } from '../nodes'

import { type ExpressionNodeInput, asExpressionNode } from './asExpressionNode'

// Constants.
export const negative = (value: ExpressionNodeInput) => new Minus(asExpressionNode(value))
export const plusMinus = (value: ExpressionNodeInput) => new PlusMinus(asExpressionNode(value))
export const recreateSignNode = (node: SignNode, value: ExpressionNodeInput) => {
	if (node instanceof Minus) return negative(value)
	if (node instanceof PlusMinus) return plusMinus(value)
	throw new Error(`Invalid sign node given: expected a sign node, but received something else.`)
}
