import { type VariableInput, type ExpressionNode, type ExpressionNodeInput, asExpressionNode, asVariable } from '../../../construction'

import { equalVariables } from '../fundamentals'
import { isVariable } from '../checks'

import { replaceDescendants } from './replacing'

export function substitute(node: ExpressionNode, variable: VariableInput, substitution: ExpressionNodeInput): ExpressionNode {
	const variableNode = asVariable(variable)
	const substitutionNode = asExpressionNode(substitution)
	return replaceDescendants(node, descendant => isVariable(descendant) && equalVariables(descendant, variableNode) ? substitutionNode : descendant)
}
