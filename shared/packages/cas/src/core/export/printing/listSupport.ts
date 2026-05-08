import { ExpressionNode } from '../../construction'
import { isConstantNode, isSign, isProduct, isFunctionNode, isPower } from '../../operations'

// Describe whether an expression node requires a plus before it if placed within a sum.
export function requiresPlusInSum(node: ExpressionNode): boolean {
	if (isSign(node)) return false
	if (isProduct(node)) return requiresPlusInSum(node.factors[0])
	return true
}

// Describe whether an expression node requires a times before it if placed within a product.
export function requiresTimesBeforeInProduct(node: ExpressionNode, previousNode: ExpressionNode): boolean {
	if (isConstantNode(node)) return true
	if (isSign(node)) return true
	if (isFunctionNode(node)) return true
	return false
}
export function requiresTimesBeforeInProductTex(node: ExpressionNode, previousNode: ExpressionNode): boolean {
	if (isPower(node)) return requiresTimesBeforeInProductTex(node.base, previousNode)
	return requiresTimesBeforeInProduct(node, previousNode)
}

// Describe whether an expression node requires a times after it if placed within a product.
export function requiresTimesAfterInProduct(node: ExpressionNode, nextNode: ExpressionNode): boolean {
	if (isFunctionNode(node)) return true
	return false
}
export function requiresTimesAfterInProductTex(node: ExpressionNode, nextNode: ExpressionNode): boolean {
	return requiresTimesAfterInProduct(node, nextNode)
}
