import { type ExpressionNode, type Power, power, product } from '../../../../construction/index.ts'

import { isPower, isProduct } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Power): ExpressionNode {
	return isProduct(node.base) ? product(...node.base.factors.map(factor => power(factor, node.exponent))) : node
}

export const expandPowersOfProducts = defineRule({
	name: 'expandPowersOfProducts',
	appliesTo: isPower,
	transform,
})
