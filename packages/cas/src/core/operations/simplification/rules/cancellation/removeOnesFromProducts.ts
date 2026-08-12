import { type ExpressionNode, type Product, product } from '../../../../construction'

import { isProduct, isOne } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: Product): ExpressionNode {
	const factors = node.factors.filter(factor => !isOne(factor))
	return factors.length === node.factors.length ? node : product(...factors)
}

export const removeOnesFromProducts = defineRule({
	name: 'removeOnesFromProducts',
	appliesTo: isProduct,
	transform,
})
