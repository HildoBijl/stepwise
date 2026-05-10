import { type ExpressionNode, type Fraction, fraction, negative } from '../../../../construction'

import { isNegativeSign } from '../../../structural'

export function cancelFractionMinuses(node: Fraction): ExpressionNode {
	const numeratorIsNegative = isNegativeSign(node.numerator)
	const denominatorIsNegative = isNegativeSign(node.denominator)
	if (!numeratorIsNegative && !denominatorIsNegative) return node

	const numerator = numeratorIsNegative ? node.numerator.node : node.numerator
	const denominator = denominatorIsNegative ? node.denominator.node : node.denominator
	const result = fraction(numerator, denominator)
	return numeratorIsNegative === denominatorIsNegative ? result : negative(result)
}
