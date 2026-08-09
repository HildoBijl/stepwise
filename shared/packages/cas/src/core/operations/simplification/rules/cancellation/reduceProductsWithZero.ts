import { type ExpressionNode, type Product, Integer } from '../../../../construction'

import { isProduct, isZero } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: Product): ExpressionNode {
	return node.factors.some(isZero) ? Integer.zero : node
}

export const reduceProductsWithZero = defineRule({
	name: 'reduceProductsWithZero',
	appliesTo: isProduct,
	transform,
})
