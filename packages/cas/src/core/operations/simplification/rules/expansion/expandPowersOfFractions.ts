import { type ExpressionNode, type Power, fraction, power } from '../../../../construction/index.ts'

import { isPower, isFraction } from '../../../structural/index.ts'

import { cancelFractionFactors } from '../cancellation/index.ts'
import { combineFractionFactors } from '../combination/index.ts'
import { defineRule } from '../ruleDefinition.ts'

function transform(node: Power): ExpressionNode {
	return isFraction(node.base) ? fraction(power(node.base.numerator, node.exponent), power(node.base.denominator, node.exponent)) : node
}

export const expandPowersOfFractions = defineRule({
	name: 'expandPowersOfFractions',
	appliesTo: isPower,
	transform,
	after: [cancelFractionFactors, combineFractionFactors],
})
