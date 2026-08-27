import { type ExpressionNode, type Fraction, fraction, negative, product, power, sum } from '../../../../construction'

import { type DerivativeContext } from '../types'

export function getFractionDerivative(node: Fraction, context: DerivativeContext): ExpressionNode {
	const numeratorDerivative = context.differentiate(node.numerator)
	const denominatorDerivative = context.differentiate(node.denominator)
	return fraction(sum(product(node.denominator, numeratorDerivative), negative(product(node.numerator, denominatorDerivative))), power(node.denominator, 2))
}
