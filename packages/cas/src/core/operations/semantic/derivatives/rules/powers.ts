import { type ExpressionNode, type Power, Integer, ln, power, product, sum } from '../../../../construction/index.ts'

import { dependsOn } from '../../../structural/index.ts'

import { type DerivativeContext } from '../types.ts'

export function getPowerDerivative(node: Power, context: DerivativeContext): ExpressionNode {
	return sum(
		dependsOn(node.base, context.variable) ? product(node.exponent, power(node.base, sum(node.exponent, -1)), context.differentiate(node.base)) : Integer.zero,
		dependsOn(node.exponent, context.variable) ? product(ln(node.base), node, context.differentiate(node.exponent)) : Integer.zero,
	)
}
