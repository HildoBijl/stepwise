import { type ExpressionNode, type Fraction, fraction, product } from '../../../../construction'

import { isFraction } from '../../../structural'

export function flattenFractions(node: Fraction): ExpressionNode {
	const { numerator, denominator } = node
	if (isFraction(numerator) && isFraction(denominator)) return fraction(product(numerator.numerator, denominator.denominator), product(numerator.denominator, denominator.numerator))
	if (isFraction(numerator)) return fraction(numerator.numerator, product(numerator.denominator, denominator))
	if (isFraction(denominator)) return fraction(product(numerator, denominator.denominator), denominator.numerator)
	return node
}
