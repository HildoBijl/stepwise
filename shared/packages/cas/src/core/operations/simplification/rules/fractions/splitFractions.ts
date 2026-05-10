import { type ExpressionNode, type Fraction, fraction, sum } from '../../../../construction'

import { isSum } from '../../../structural'

export function splitFractions(node: Fraction): ExpressionNode {
	if (!isSum(node.numerator)) return node
	return sum(...node.numerator.terms.map(term => fraction(term, node.denominator)))
}
