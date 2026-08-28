import { first, product as arrayProduct, partition } from '@step-wise/js-utils'

import { type ExpressionNode, type Product, integer, float, product } from '../../../../construction/index.ts'

import { isProduct, isNumberNode, isFloatNode } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Product): ExpressionNode {
	const [numberFactors, nonNumberFactors] = partition(node.factors, node => isNumberNode(node))
	if (numberFactors.length === 0 || (numberFactors.length === 1 && isNumberNode(first(node.factors)))) return node
	const value = arrayProduct(numberFactors.map(node => node.value))
	const constant = numberFactors.some(isFloatNode) ? float(value) : integer(value)
	return product(constant, ...nonNumberFactors)
}

export const combineNumbersInProducts = defineRule({
	name: 'combineNumbersInProducts',
	appliesTo: isProduct,
	transform,
})
