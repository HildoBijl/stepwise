import { ExpressionNode } from '../../construction'
import { isConstantNode, isSignNode, isFunctionNode, isPower } from '../../operations'

// Describe whether there should be a plus symbol between two nodes in a sum.
export function requiresPlusBetweenNodes(nextNode: ExpressionNode, previousNode: ExpressionNode): boolean {
	return !isSignNode(nextNode)
}
export function requiresPlusBetweenNodesTex(nextNode: ExpressionNode, previousNode: ExpressionNode): boolean {
	return requiresPlusBetweenNodes(nextNode, previousNode)
}

// Describe whether there should be a times symbol between two nodes in a product.
export function requiresTimesBetweenFactors(nextNode: ExpressionNode, previousNode: ExpressionNode): boolean {
	if (isConstantNode(nextNode)) return true
	if (isSignNode(nextNode)) return true
	if (isFunctionNode(previousNode) && !isPower(previousNode)) return true
	if (isPower(nextNode)) return requiresTimesBetweenFactors(nextNode.base, previousNode)
	if (isFunctionNode(nextNode)) return true
	return false
}
export function requiresTimesBetweenFactorsTex(nextNode: ExpressionNode, previousNode: ExpressionNode): boolean {
	return requiresTimesBetweenFactors(nextNode, previousNode)
}
