import { type ExpressionNode, type ExpressionNodeInput, asExpressionNode, Integer, negative, sum, product, fraction } from '../../../construction'

import { isSignNode } from '../fundamentals'

export const add = (...terms: ExpressionNodeInput[]) => sum(...terms)
export const subtract = (minuend: ExpressionNodeInput = Integer.zero, subtrahend: ExpressionNodeInput = Integer.zero) => sum(minuend, negative(subtrahend))
export const multiply = (...factors: ExpressionNodeInput[]) => product(...factors)
export const divide = (numerator: ExpressionNodeInput, denominator: ExpressionNodeInput) => fraction(numerator, denominator)
export const abs = (node: ExpressionNodeInput): ExpressionNode => {
	const expressionNode = asExpressionNode(node)
	return isSignNode(expressionNode) ? abs(expressionNode.node) : expressionNode
}
