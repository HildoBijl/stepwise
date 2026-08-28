import { type ExpressionNode, type Sum, sum } from '../../../../construction/index.ts'

import { type DerivativeContext } from '../types.ts'

export function getSumDerivative(node: Sum, context: DerivativeContext): ExpressionNode {
	return sum(...node.terms.map(context.differentiate))
}
