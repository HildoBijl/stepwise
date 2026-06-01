import { type ExpressionNode, type Fraction, negative, fraction } from '../../../../construction'

import { isMinus } from '../../../structural'

export function mergeFractionMinuses(node: Fraction): ExpressionNode {
	const numeratorIsNegative = isMinus(node.numerator)
	const denominatorIsNegative = isMinus(node.denominator)
	if (!numeratorIsNegative && !denominatorIsNegative) return node

	const numerator = numeratorIsNegative ? node.numerator.node : node.numerator
	const denominator = denominatorIsNegative ? node.denominator.node : node.denominator
	const result = fraction(numerator, denominator)
	return numeratorIsNegative === denominatorIsNegative ? result : negative(result)
}
