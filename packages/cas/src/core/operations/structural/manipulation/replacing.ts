import { type VariableInput, type ExpressionNode, type ExpressionNodeInput, type Variable, asExpressionNode, asVariable } from '../../../construction/index.ts'

import { type NodeAncestors, type OrderedTraversalOptions, isVariable, areVariablesEqual } from '../inspection/index.ts'

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

// Apply multiple substitutions simultaneously. Substitution nodes are not traversed, preventing cascading substitutions.
export function substituteAll(node: ExpressionNode, variables: readonly VariableInput[], substitutions: readonly ExpressionNodeInput[]): ExpressionNode {
	if (variables.length !== substitutions.length) throw new Error(`Invalid substituteAll call: got ${variables.length} variables but ${substitutions.length} substitutions.`)
	const variableNodes = variables.map(asVariable)
	const substitutionNodes = substitutions.map(asExpressionNode)
	return substituteAllInternal(node, variableNodes, substitutionNodes)
}
function substituteAllInternal(node: ExpressionNode, variables: readonly Variable[], substitutions: readonly ExpressionNode[]): ExpressionNode {
	if (isVariable(node)) {
		const index = variables.findIndex(variableNode => areVariablesEqual(node, variableNode))
		if (index !== -1) return substitutions[index]
	}
	return node.recreateWithChildren(node.children.map(child => substituteAllInternal(child, variables, substitutions)))
}
