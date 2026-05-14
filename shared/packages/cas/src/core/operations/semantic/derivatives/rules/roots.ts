import { type ExpressionNode, type Root, type Sqrt, Integer, negative, sum, product, fraction, power, sqrt, root, ln } from '../../../../construction'

import { dependsOn } from '../../../structural'

import { type DerivativeContext } from '../types'

export function getSqrtDerivative(node: Sqrt, context: DerivativeContext): ExpressionNode {
	return fraction(context.getDerivative(node.argument), product(2, sqrt(node.argument)))
}

export function getRootDerivative(node: Root, context: DerivativeContext): ExpressionNode {
	return sum(
		dependsOn(node.argument, context.variable) ? fraction(context.getDerivative(node.argument), product(node.base, root(power(node.argument, sum(node.base, -1)), node.base))) : Integer.zero,
		dependsOn(node.base, context.variable) ? negative(fraction(product(ln(node.argument), node, context.getDerivative(node.base)), power(node.base, 2))) : Integer.zero,
	)
}
