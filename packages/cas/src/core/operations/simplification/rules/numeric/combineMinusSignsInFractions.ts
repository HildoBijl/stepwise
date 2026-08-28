import { type ExpressionNode, type Fraction, negative, fraction } from '../../../../construction/index.ts'

import { isFraction, isMinus } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

export function applyCombineMinusSignsInFractions(node: Fraction): ExpressionNode {
	const numeratorIsNegative = isMinus(node.numerator)
	const denominatorIsNegative = isMinus(node.denominator)
	if (!numeratorIsNegative && !denominatorIsNegative) return node

	const numerator = numeratorIsNegative ? node.numerator.node : node.numerator
	const denominator = denominatorIsNegative ? node.denominator.node : node.denominator
	const result = fraction(numerator, denominator)
	return numeratorIsNegative === denominatorIsNegative ? result : negative(result)
}

export const combineMinusSignsInFractions = defineRule({
	name: 'combineMinusSignsInFractions',
	appliesTo: isFraction,
	transform: applyCombineMinusSignsInFractions,
})
