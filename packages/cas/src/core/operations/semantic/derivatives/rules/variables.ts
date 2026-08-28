import { type ExpressionNode, type Variable, Integer } from '../../../../construction/index.ts'

import { areVariablesEqual } from '../../../structural/index.ts'

export function getVariableDerivative(node: Variable, context: { variable: Variable }): ExpressionNode {
	return areVariablesEqual(node, context.variable) ? Integer.one : Integer.zero
}
