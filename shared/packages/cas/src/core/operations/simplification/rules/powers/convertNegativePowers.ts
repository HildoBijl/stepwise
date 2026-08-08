import { isPower, isMinus } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type ExpressionNode, type Power, fraction, power } from '../../../../construction'

function transform(node: Power): ExpressionNode {
	return isMinus(node.exponent) ? fraction(1, power(node.base, node.exponent.node)) : node
}

export const convertNegativePowers = defineRule({
	appliesTo: isPower,
	transform,
})
