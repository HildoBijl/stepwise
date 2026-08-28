import { type ExpressionNode, type Product, plusMinus, product } from '../../../../construction/index.ts'

import { isProduct, isPlusMinus } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

import { combineMinusSignsInProducts } from './combineMinusSignsInProducts.ts'

function transform(node: Product): ExpressionNode {
	return node.factors.some(factor => isPlusMinus(factor)) ? plusMinus(product(...node.factors.map(factor => isPlusMinus(factor) ? factor.node : factor))) : node
}

export const combinePlusMinusSignsInProducts = defineRule({
	name: 'combinePlusMinusSignsInProducts',
	appliesTo: isProduct,
	transform,
	requires: [combineMinusSignsInProducts],
})
