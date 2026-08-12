import { type ExpressionNode, type Product, plusMinus, product } from '../../../../construction'

import { isProduct, isPlusMinus } from '../../../structural'

import { defineRule } from '../ruleDefinition'

import { mergeProductMinuses } from './mergeProductMinuses'

function transform(node: Product): ExpressionNode {
	return node.factors.some(factor => isPlusMinus(factor)) ? plusMinus(product(...node.factors.map(factor => isPlusMinus(factor) ? factor.node : factor))) : node
}

export const mergeProductPlusMinuses = defineRule({
	name: 'mergeProductPlusMinuses',
	appliesTo: isProduct,
	transform,
	requires: [mergeProductMinuses],
})
