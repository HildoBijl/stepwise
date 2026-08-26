import { type ExpressionNode, type Fraction } from '../../../../construction'

import { isFraction, isZero } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: Fraction): ExpressionNode {
	return isZero(node.numerator) && !isZero(node.denominator) ? node.numerator : node
}

export const reduceFractionsWithZeroNumerator = defineRule({
	name: 'reduceFractionsWithZeroNumerator',
	appliesTo: isFraction,
	transform,
})
