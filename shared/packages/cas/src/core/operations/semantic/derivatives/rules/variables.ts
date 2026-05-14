import { type ExpressionNode, type Variable, Integer } from '../../../../construction'

import { equalVariables } from '../../../structural'

export function getVariableDerivative(node: Variable, context: { variable: Variable }): ExpressionNode {
	return equalVariables(node, context.variable) ? Integer.one : Integer.zero
}
