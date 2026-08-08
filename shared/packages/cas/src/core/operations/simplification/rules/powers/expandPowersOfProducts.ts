import { type ExpressionNode, type Power, power, product } from '../../../../construction'

import { isPower, isProduct } from '../../../structural'

import { defineRule } from '../utils'

function transform(node: Power): ExpressionNode {
	return isProduct(node.base) ? product(...node.base.factors.map(factor => power(factor, node.exponent))) : node
}

export const expandPowersOfProducts = defineRule({
	appliesTo: isPower,
	transform,
})
