import { type ExpressionNode, type Power, fraction, power } from '../../../../construction'

import { isPower, isFraction } from '../../../structural'

import { cancelFractionFactors } from '../cancellation'
import { combineFractionFactors } from '../combination'
import { defineRule } from '../ruleDefinition'

function transform(node: Power): ExpressionNode {
	return isFraction(node.base) ? fraction(power(node.base.numerator, node.exponent), power(node.base.denominator, node.exponent)) : node
}

export const expandPowersOfFractions = defineRule({
	name: 'expandPowersOfFractions',
	appliesTo: isPower,
	transform,
	after: [cancelFractionFactors, combineFractionFactors],
})
