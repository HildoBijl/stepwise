import { type ExpressionNode, type Fraction, negative, sum, fraction } from '../../../../construction'

import { isFraction, isMinus, isSum } from '../../../structural'

import { defineRule } from '../ruleDefinition'

import { removeDoubleNegatives, applyRemoveDoubleNegatives } from './removeDoubleNegatives'

import { mergeFractionMinuses, applyMergeFractionMinuses } from './mergeFractionMinuses'

function transform(node: Fraction): ExpressionNode {
	const fixedNumerator = fixNegativeSum(node.numerator)
	const fixedDenominator = fixNegativeSum(node.denominator)
	if (node.numerator === fixedNumerator && node.denominator === fixedDenominator) return node
	return applyMergeFractionMinuses(fraction(fixedNumerator, fixedDenominator))
}

function fixNegativeSum(node: ExpressionNode): ExpressionNode {
	return isSum(node) && node.terms.every(isMinus) ? applyRemoveDoubleNegatives(negative(sum(...node.terms.map(term => applyRemoveDoubleNegatives(negative(term)))))) : node
}

export const mergeFractionSumMinuses = defineRule({
	name: 'mergeFractionSumMinuses',
	appliesTo: isFraction,
	transform,
	requires: [mergeFractionMinuses, removeDoubleNegatives],
})
