import { type ExpressionNode, type SignNode } from '../../../../construction'

import { type DerivativeContext } from '../types'

export function getSignDerivative(node: SignNode, context: DerivativeContext): ExpressionNode {
	return node.recreateWith(context.getDerivative(node.node))
}
