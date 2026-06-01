import { type ExpressionNode, type Fraction, negative, sum, fraction } from '../../../../construction'

import { isMinus, isSum } from '../../../structural'

import { removeDoubleNegatives } from '../signs/removeDoubleNegatives'

import { mergeFractionMinuses } from './mergeFractionMinuses'

export function mergeFractionSumMinuses(node: Fraction): ExpressionNode {
	const fixedNumerator = fixNegativeSum(node.numerator)
	const fixedDenominator = fixNegativeSum(node.denominator)
	if (node.numerator === fixedNumerator && node.denominator === fixedDenominator) return node
	return mergeFractionMinuses(fraction(fixedNumerator, fixedDenominator))
}

function fixNegativeSum(node: ExpressionNode): ExpressionNode {
	return isSum(node) && node.terms.every(isMinus) ? removeDoubleNegatives(negative(sum(...node.terms.map(term => removeDoubleNegatives(negative(term)))))) : node
}
