import { isPower, isFraction } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type ExpressionNode, type Power, fraction, power } from '../../../../construction'

function transform(node: Power): ExpressionNode {
	return isFraction(node.base) ? fraction(power(node.base.numerator, node.exponent), power(node.base.denominator, node.exponent)) : node
}

export const expandPowersOfFractions = defineRule({
	appliesTo: isPower,
	transform,
})
