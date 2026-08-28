import { type ExpressionNode, type SignNode } from '../../../../construction/index.ts'

import { type DerivativeContext } from '../types.ts'

export function getSignDerivative(node: SignNode, context: DerivativeContext): ExpressionNode {
	return node.recreateWith(context.differentiate(node.node))
}
