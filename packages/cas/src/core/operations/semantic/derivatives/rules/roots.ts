import { type ExpressionNode, type Root, type Sqrt, Integer, negative, sum, product, fraction, power, sqrt, root, ln } from '../../../../construction/index.ts'

import { dependsOn } from '../../../structural/index.ts'

import { type DerivativeContext } from '../types.ts'

export function getSqrtDerivative(node: Sqrt, context: DerivativeContext): ExpressionNode {
	return fraction(context.differentiate(node.radicand), product(2, sqrt(node.radicand)))
}

export function getRootDerivative(node: Root, context: DerivativeContext): ExpressionNode {
	return sum(
		dependsOn(node.radicand, context.variable) ? fraction(context.differentiate(node.radicand), product(node.degree, root(power(node.radicand, sum(node.degree, -1)), node.degree))) : Integer.zero,
		dependsOn(node.degree, context.variable) ? negative(fraction(product(ln(node.radicand), node, context.differentiate(node.degree)), power(node.degree, 2))) : Integer.zero,
	)
}
