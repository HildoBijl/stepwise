import { ExpressionNode, Constant, PlusMinus, Product } from '../nodes'

// Describe whether an expression node requires a plus before it if placed within a sum.
export function requiresPlusInSum(node: ExpressionNode): boolean {
	if (node instanceof Constant) return node.value >= 0
	if (node instanceof PlusMinus) return false
	if (node instanceof Product) return requiresPlusInSum(node.factors[0])
	return true
}

// Describe whether an expression node requires a times before it if placed within a product.
export function requiresTimesBeforeInProduct(node: ExpressionNode, previousNode: ExpressionNode): boolean {
	if (node instanceof Constant) return true
	return false
}
export function requiresTimesBeforeInProductTex(node: ExpressionNode, previousNode: ExpressionNode): boolean {
	return requiresTimesBeforeInProduct(node, previousNode)
}

// Describe whether an expression node requires a times after it if placed within a product.
export function requiresTimesAfterInProduct(node: ExpressionNode, nextNode: ExpressionNode): boolean {
	return false
}
export function requiresTimesAfterInProductTex(node: ExpressionNode, nextNode: ExpressionNode): boolean {
	return requiresTimesAfterInProduct(node, nextNode)
}
