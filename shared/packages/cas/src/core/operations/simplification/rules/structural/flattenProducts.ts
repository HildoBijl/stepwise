import { type ExpressionNode, type Product, product } from '../../../../construction'

import { isProduct } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: Product): ExpressionNode {
	const factors = node.factors.flatMap(factor => isProduct(factor) ? factor.factors : [factor])
	return factors.length === node.factors.length ? node : product(...factors)
}

export const flattenProducts = defineRule({
	name: 'flattenProducts',
	appliesTo: isProduct,
	transform,
})
