import { type ExpressionNode, type Fraction, fraction, sum } from '../../../../construction/index.ts'

import { isFraction, isSum } from '../../../structural/index.ts'

import { cancelFractionFactors } from '../cancellation/index.ts'
import { combineSumFractions, combineFractionFactors } from '../combination/index.ts'
import { defineRule } from '../ruleDefinition.ts'

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
