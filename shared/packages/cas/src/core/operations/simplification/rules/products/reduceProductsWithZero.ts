import { isProduct, isZero } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type ExpressionNode, type Product, Integer } from '../../../../construction'

function transform(node: Product): ExpressionNode {
	return node.factors.some(isZero) ? Integer.zero : node
}

export const reduceProductsWithZero = defineRule({
	appliesTo: isProduct,
	transform,
})
