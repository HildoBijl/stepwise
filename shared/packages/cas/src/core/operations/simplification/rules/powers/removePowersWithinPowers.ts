import { type ExpressionNode, type Power, power, product } from '../../../../construction'

import { isPower } from '../../../structural'

import { defineRule } from '../utils'

function transform(node: Power): ExpressionNode {
	return isPower(node.base) ? power(node.base.base, product(node.base.exponent, node.exponent)) : node
}

export const removePowersWithinPowers = defineRule({
	appliesTo: isPower,
	transform,
})
