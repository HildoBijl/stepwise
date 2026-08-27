import { type ExpressionNode, type Fraction, fraction, sum } from '../../../../construction'

import { isFraction, isSum } from '../../../structural'

import { cancelFractionFactors } from '../cancellation'
import { combineSumFractions, combineFractionFactors } from '../combination'
import { defineRule } from '../ruleDefinition'

function transform(node: Fraction): ExpressionNode {
	if (!isSum(node.numerator)) return node
	return sum(...node.numerator.terms.map(term => fraction(term, node.denominator)))
}

export const splitFractions = defineRule({
	name: 'splitFractions',
	appliesTo: isFraction,
	transform,
	conflictsWith: [combineSumFractions],
	after: [cancelFractionFactors, combineFractionFactors],
})
