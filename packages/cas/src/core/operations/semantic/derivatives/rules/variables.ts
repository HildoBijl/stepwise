import { type ExpressionNode, type Variable, Integer } from '../../../../construction'

import { areVariablesEqual } from '../../../structural'

export function getVariableDerivative(node: Variable, context: { variable: Variable }): ExpressionNode {
	return areVariablesEqual(node, context.variable) ? Integer.one : Integer.zero
}
