import { type ExpressionNode, type Sum, type Fraction, negative, sum, fraction } from '../../../../construction'

import { isMinus, isSum } from '../../../structural'

import { removeDoubleNegatives } from '../signs/removeDoubleNegatives'

export function mergeFractionMinuses(node: Fraction): ExpressionNode {
	const fixedNumerator = fixNegativeSum(node.numerator)
	const fixedDenominator = fixNegativeSum(node.denominator)
	const numeratorIsNegative = isMinus(fixedNumerator)
	const denominatorIsNegative = isMinus(fixedDenominator)
	if (!numeratorIsNegative && !denominatorIsNegative && !isMinus(node.numerator) && !isMinus(node.denominator)) return node

	const numerator = numeratorIsNegative ? fixedNumerator.node : fixedNumerator
	const denominator = denominatorIsNegative ? fixedDenominator.node : fixedDenominator
	const result = fraction(numerator, denominator)
	return numeratorIsNegative === denominatorIsNegative ? result : negative(result)
}

function fixNegativeSum(node: ExpressionNode): ExpressionNode {
	return isSum(node) && node.terms.every(isMinus) ? removeDoubleNegatives(negative(sum(...node.terms.map(term => removeDoubleNegatives(negative(term)))))) : node
}
