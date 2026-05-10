import { type ExpressionNode, type Fraction, fraction } from '../../../../construction'

import { getSumTerms, getCommonFactors, removeFactors } from '../utils'

export function cancelFractionFactors(node: Fraction): ExpressionNode {
	const commonFactors = getCommonFactors(...getSumTerms(node.numerator), ...getSumTerms(node.denominator))
	if (commonFactors.length === 0) return node
	return fraction(removeFactors(node.numerator, commonFactors), removeFactors(node.denominator, commonFactors))
}
