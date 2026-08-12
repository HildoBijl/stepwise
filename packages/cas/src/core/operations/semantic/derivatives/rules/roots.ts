import { type ExpressionNode, type Root, type Sqrt, Integer, negative, sum, product, fraction, power, sqrt, root, ln } from '../../../../construction'

import { dependsOn } from '../../../structural'

import { type DerivativeContext } from '../types'

export function getSqrtDerivative(node: Sqrt, context: DerivativeContext): ExpressionNode {
	return fraction(context.getDerivative(node.radicand), product(2, sqrt(node.radicand)))
}

export function getRootDerivative(node: Root, context: DerivativeContext): ExpressionNode {
	return sum(
		dependsOn(node.radicand, context.variable) ? fraction(context.getDerivative(node.radicand), product(node.degree, root(power(node.radicand, sum(node.degree, -1)), node.degree))) : Integer.zero,
		dependsOn(node.degree, context.variable) ? negative(fraction(product(ln(node.radicand), node, context.getDerivative(node.degree)), power(node.degree, 2))) : Integer.zero,
	)
}
