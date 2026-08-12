import { type ExpressionNode, type ConstantNode, Integer, integer, sum, product } from '../../../../construction'

import { isSignNode, isConstantNode, isSum, isProduct } from '../../../structural'

// Get the number that's at the front of the given expression.
export function getLeadingNumber(node: ExpressionNode): ConstantNode {
	if (isConstantNode(node)) return node
	if (isSignNode(node)) return getLeadingNumber(node.node)
	if (isProduct(node) && node.factors.length > 0 && isConstantNode(node.factors[0])) return node.factors[0]
	return Integer.one
}

// Take the expression's leading number and divide it by the given factor. It assumes that's possible.
export function divideLeadingNumberBy(node: ExpressionNode, divisor: number): ExpressionNode {
	if (isConstantNode(node)) return integer(node.value / divisor)
	if (isSignNode(node)) return node.recreateWith(divideLeadingNumberBy(node.node, divisor))
	if (isSum(node)) return sum(...node.terms.map(term => divideLeadingNumberBy(term, divisor)))
	if (isProduct(node) && node.factors.length > 0 && isConstantNode(node.factors[0])) return product(divideLeadingNumberBy(node.factors[0], divisor), ...node.factors.slice(1))
	throw new Error(`Could not divide the leading number of the expression by the factor: the types don't line up.`)
}
