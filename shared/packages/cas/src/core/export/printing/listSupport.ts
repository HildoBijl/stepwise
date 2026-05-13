import { ExpressionNode } from '../../construction'
import { isConstantNode, isSignNode, isFunctionNode, isPower } from '../../operations'

// Describe whether an expression node requires a plus before it if placed within a sum.
export function requiresPlusInSum(node: ExpressionNode): boolean {
	return !isSignNode(node)
}

// Describe whether an expression node requires a times before it if placed within a product.
export function requiresTimesBeforeInProduct(node: ExpressionNode, previousNode: ExpressionNode): boolean {
	if (isConstantNode(node)) return true
	if (isSignNode(node)) return true
	if (isPower(node)) return requiresTimesBeforeInProduct(node.base, previousNode)
	if (isFunctionNode(node)) return true
	return false
}
export function requiresTimesBeforeInProductTex(node: ExpressionNode, previousNode: ExpressionNode): boolean {
	return requiresTimesBeforeInProduct(node, previousNode)
}

// Describe whether an expression node requires a times after it if placed within a product.
export function requiresTimesAfterInProduct(node: ExpressionNode, nextNode: ExpressionNode): boolean {
	if (isPower(node)) return false
	if (isFunctionNode(node)) return true
	return false
}
export function requiresTimesAfterInProductTex(node: ExpressionNode, nextNode: ExpressionNode): boolean {
	return requiresTimesAfterInProduct(node, nextNode)
}
