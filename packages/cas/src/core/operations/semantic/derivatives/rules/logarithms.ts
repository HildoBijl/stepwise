import { type ExpressionNode, type Ln, type Log, fraction, ln, product } from '../../../../construction'

import { type DerivativeContext } from '../types'

export function getLnDerivative(node: Ln, context: DerivativeContext): ExpressionNode {
	return fraction(context.getDerivative(node.argument), node.argument)
}

export function getLogDerivative(node: Log, context: DerivativeContext): ExpressionNode {
	return fraction(context.getDerivative(node.argument), product(node.argument, ln(node.base)))
}
