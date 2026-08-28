import { type ExpressionNode, type Fraction, fraction, product } from '../../../../construction/index.ts'

import { isFraction } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Fraction): ExpressionNode {
	const { numerator, denominator } = node
	if (isFraction(numerator) && isFraction(denominator)) return fraction(product(numerator.numerator, denominator.denominator), product(numerator.denominator, denominator.numerator))
	if (isFraction(numerator)) return fraction(numerator.numerator, product(numerator.denominator, denominator))
	if (isFraction(denominator)) return fraction(product(numerator, denominator.denominator), denominator.numerator)
	return node
}

export const flattenFractions = defineRule({
	name: 'flattenFractions',
	appliesTo: isFraction,
	transform,
})
