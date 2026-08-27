import { type ExpressionNode, type Ln, type Log, fraction, ln, negative, power, product, sum } from '../../../../construction'

import { type DerivativeContext } from '../types'

export function getLnDerivative(node: Ln, context: DerivativeContext): ExpressionNode {
	return fraction(context.differentiate(node.argument), node.argument)
}

export function getLogDerivative(node: Log, context: DerivativeContext): ExpressionNode {
	return sum(
		fraction(context.differentiate(node.argument), product(node.argument, ln(node.base))),
		negative(fraction(product(ln(node.argument), context.differentiate(node.base)), product(node.base, power(ln(node.base), 2)))),
	)
}
