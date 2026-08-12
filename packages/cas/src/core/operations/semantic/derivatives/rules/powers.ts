import { type ExpressionNode, type Power, Integer, ln, power, product, sum } from '../../../../construction'

import { dependsOn } from '../../../structural'

import { type DerivativeContext } from '../types'

export function getPowerDerivative(node: Power, context: DerivativeContext): ExpressionNode {
	return sum(
		dependsOn(node.base, context.variable) ? product(node.exponent, power(node.base, sum(node.exponent, -1)), context.getDerivative(node.base)) : Integer.zero,
		dependsOn(node.exponent, context.variable) ? product(ln(node.base), node, context.getDerivative(node.exponent)) : Integer.zero,
	)
}
