import { isProduct } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type ExpressionNode, type Product, product } from '../../../../construction'

function transform(node: Product): ExpressionNode {
	const factors = node.factors.flatMap(factor => isProduct(factor) ? factor.factors : [factor])
	return factors.length === node.factors.length ? node : product(...factors)
}

export const flattenProducts = defineRule({
	appliesTo: isProduct,
	transform,
})
