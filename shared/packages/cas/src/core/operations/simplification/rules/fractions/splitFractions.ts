import { type ExpressionNode, type Fraction, fraction, sum } from '../../../../construction'

import { isFraction, isSum } from '../../../structural'

import { defineRule } from '../utils'

function transform(node: Fraction): ExpressionNode {
	if (!isSum(node.numerator)) return node
	return sum(...node.numerator.terms.map(term => fraction(term, node.denominator)))
}

export const splitFractions = defineRule({
	appliesTo: isFraction,
	transform,
	conflictsWith: ['mergeFractionSums'],
})
