import { type ExpressionNode, type Power, fraction, power } from '../../../../construction'

import { isPower, isMinus } from '../../../structural'

import { defineRule } from '../utils'

function transform(node: Power): ExpressionNode {
	return isMinus(node.exponent) ? fraction(1, power(node.base, node.exponent.node)) : node
}

export const convertNegativePowers = defineRule({
	appliesTo: isPower,
	transform,
})
