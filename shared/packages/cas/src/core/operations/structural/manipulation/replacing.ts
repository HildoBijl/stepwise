import { type VariableInput, type ExpressionNode, type ExpressionNodeInput, asExpressionNode, asVariable } from '../../../construction'

import { isVariable } from '../fundamentals'
import { equalVariables } from '../comparisons'

import { type NodeAncestors } from '../checks'

export type NodeTransform = (node: ExpressionNode, parents: readonly ExpressionNode[]) => ExpressionNode

// Run a replacer function on each descendant. Start at the leaves and work upwards.
export function mapDescendants(node: ExpressionNode, transform: NodeTransform, childrenFirst = true, includeSelf = true, ancestors: NodeAncestors = []): ExpressionNode {
	if (includeSelf && !childrenFirst) node = transform(node, ancestors)
	node = node.recreateWithChildren(node.children.map(child => mapDescendants(child, transform, childrenFirst, true, [...ancestors, node])))
	if (includeSelf && childrenFirst) node = transform(node, ancestors)
	return node
}

// Apply substitution within a node.
export function substitute(node: ExpressionNode, variable: VariableInput, substitution: ExpressionNodeInput): ExpressionNode {
	const variableNode = asVariable(variable)
	const substitutionNode = asExpressionNode(substitution)
	return mapDescendants(node, descendant => isVariable(descendant) && equalVariables(descendant, variableNode) ? substitutionNode : descendant, true, true)
}
