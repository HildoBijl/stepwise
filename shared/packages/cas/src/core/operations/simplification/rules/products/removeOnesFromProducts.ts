import { isProduct, isOne } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type ExpressionNode, type Product, product } from '../../../../construction'

function transform(node: Product): ExpressionNode {
	const factors = node.factors.filter(factor => !isOne(factor))
	return factors.length === node.factors.length ? node : product(...factors)
}

export const removeOnesFromProducts = defineRule({
	appliesTo: isProduct,
	transform,
})
