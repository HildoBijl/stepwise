import { type VariableInput, type ExpressionNode, type ExpressionNodeInput, asExpressionNode, asVariable } from '../../../construction'

import { type NodeAncestors, type OrderedTraversalOptions, isVariable, areVariablesEqual } from '../fundamentals'

export type NodeTransform = (node: ExpressionNode, ancestors: NodeAncestors) => ExpressionNode

// Transform selected nodes in an expression tree. Start at the leaves by default.
export function mapNodes(node: ExpressionNode, transform: NodeTransform, options: OrderedTraversalOptions = {}): ExpressionNode {
	return mapNodesInternal(node, transform, options.childrenFirst ?? true, options.includeSelf ?? true, [])
}
function mapNodesInternal(node: ExpressionNode, transform: NodeTransform, childrenFirst: boolean, includeSelf: boolean, ancestors: NodeAncestors): ExpressionNode {
	if (includeSelf && !childrenFirst) node = transform(node, ancestors)
	node = node.recreateWithChildren(node.children.map(child => mapNodesInternal(child, transform, childrenFirst, true, [...ancestors, node])))
	if (includeSelf && childrenFirst) node = transform(node, ancestors)
	return node
}

// Apply substitution within a node.
export function substitute(node: ExpressionNode, variable: VariableInput, substitution: ExpressionNodeInput): ExpressionNode {
	const variableNode = asVariable(variable)
	const substitutionNode = asExpressionNode(substitution)
	return mapNodes(node, descendant => isVariable(descendant) && areVariablesEqual(descendant, variableNode) ? substitutionNode : descendant)
}
