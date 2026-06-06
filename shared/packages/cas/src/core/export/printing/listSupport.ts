import { type InterpretationSettings } from '@step-wise/math-input-value'

import { ExpressionNode } from '../../construction'
import { isNumberNode, isVariable, isSignNode, isFraction, isFunctionNode, isPower } from '../../operations'

// Describe whether there should be a plus symbol between two nodes in a sum.
export function requiresPlusBetweenNodes(nextNode: ExpressionNode, previousNode: ExpressionNode): boolean {
	return !isSignNode(nextNode)
}
export function requiresPlusBetweenNodesTex(nextNode: ExpressionNode, previousNode: ExpressionNode): boolean {
	return requiresPlusBetweenNodes(nextNode, previousNode)
}

// Describe whether there should be a times symbol between two nodes in a product.
export function requiresTimesBetweenFactors(nextNode: ExpressionNode, previousNode: ExpressionNode, settings: InterpretationSettings): boolean {
	if (isNumberNode(nextNode)) return true
	if (isFraction(previousNode) || isFraction(nextNode)) return true
	if (isPower(nextNode)) return requiresTimesBetweenFactors(nextNode.base, previousNode, settings)
	if (isFunctionNode(nextNode)) return isVariable(previousNode)
	if (isVariable(previousNode) && settings.multiCharacterVariables) return true
	return false
}
export function requiresTimesBetweenFactorsTex(nextNode: ExpressionNode, previousNode: ExpressionNode, settings: InterpretationSettings): boolean {
	if (isFraction(previousNode) || isFraction(nextNode)) return false
	if (isFunctionNode(nextNode) && !isPower(nextNode)) return false
	return requiresTimesBetweenFactors(nextNode, previousNode, settings)
}
