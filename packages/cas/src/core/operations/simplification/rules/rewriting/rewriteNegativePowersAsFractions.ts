import { type ExpressionNode, type Power, fraction, power } from '../../../../construction/index.ts'

import { isPower, isMinus } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Power): ExpressionNode {
	return isMinus(node.exponent) ? fraction(1, power(node.base, node.exponent.node)) : node
}

export const rewriteNegativePowersAsFractions = defineRule({
	name: 'rewriteNegativePowersAsFractions',
	appliesTo: isPower,
	transform,
})
