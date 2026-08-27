import { type ExpressionNode, type Product, plusMinus, product } from '../../../../construction'

import { isProduct, isPlusMinus } from '../../../structural'

import { defineRule } from '../ruleDefinition'

import { combineMinusSignsInProducts } from './combineMinusSignsInProducts'

function transform(node: Product): ExpressionNode {
	return node.factors.some(factor => isPlusMinus(factor)) ? plusMinus(product(...node.factors.map(factor => isPlusMinus(factor) ? factor.node : factor))) : node
}

export const combinePlusMinusSignsInProducts = defineRule({
	name: 'combinePlusMinusSignsInProducts',
	appliesTo: isProduct,
	transform,
	requires: [combineMinusSignsInProducts],
})
