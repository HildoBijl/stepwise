import { type ExpressionNode, type Product, product } from '../../../../construction/index.ts'

import { isProduct } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Product): ExpressionNode {
	const factors = node.factors.flatMap(factor => isProduct(factor) ? factor.factors : [factor])
	return factors.length === node.factors.length ? node : product(...factors)
}

export const flattenProducts = defineRule({
	name: 'flattenProducts',
	appliesTo: isProduct,
	transform,
})
