import { type ExpressionNode, type Sum, sum } from '../../../../construction'

import { type DerivativeContext } from '../types'

export function getSumDerivative(node: Sum, context: DerivativeContext): ExpressionNode {
	return sum(...node.terms.map(context.getDerivative))
}
