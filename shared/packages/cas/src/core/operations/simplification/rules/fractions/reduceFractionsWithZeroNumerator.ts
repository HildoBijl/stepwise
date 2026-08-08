import { type ExpressionNode, type Fraction } from '../../../../construction'

import { isFraction, isZero } from '../../../structural'

import { defineRule } from '../utils'

function transform(node: Fraction): ExpressionNode {
	return isZero(node.numerator) ? node.numerator : node
}

export const reduceFractionsWithZeroNumerator = defineRule({
	appliesTo: isFraction,
	transform,
})
