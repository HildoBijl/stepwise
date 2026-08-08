import { isProduct, isPlusMinus } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type ExpressionNode, type Product, plusMinus, product } from '../../../../construction'

function transform(node: Product): ExpressionNode {
	return node.factors.some(factor => isPlusMinus(factor)) ? plusMinus(product(...node.factors.map(factor => isPlusMinus(factor) ? factor.node : factor))) : node
}

export const mergeProductPlusMinuses = defineRule({
	appliesTo: isProduct,
	transform,
})
