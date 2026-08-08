import { isFraction } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type ExpressionNode, type Fraction, fraction, product } from '../../../../construction'

function transform(node: Fraction): ExpressionNode {
	const { numerator, denominator } = node
	if (isFraction(numerator) && isFraction(denominator)) return fraction(product(numerator.numerator, denominator.denominator), product(numerator.denominator, denominator.numerator))
	if (isFraction(numerator)) return fraction(numerator.numerator, product(numerator.denominator, denominator))
	if (isFraction(denominator)) return fraction(product(numerator, denominator.denominator), denominator.numerator)
	return node
}

export const flattenFractions = defineRule({
	appliesTo: isFraction,
	transform,
})
