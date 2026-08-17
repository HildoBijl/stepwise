import { first, product as arrayProduct, splitArray } from '@step-wise/js-utils'

import { type ExpressionNode, type Product, integer, float, product } from '../../../../construction'

import { isProduct, isNumberNode, isFloatNode } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: Product): ExpressionNode {
	const [numberFactors, nonNumberFactors] = splitArray(node.factors, node => isNumberNode(node))
	if (numberFactors.length === 0 || (numberFactors.length === 1 && isNumberNode(first(node.factors)))) return node
	const value = arrayProduct(numberFactors.map(node => node.value))
	const constant = numberFactors.some(isFloatNode) ? float(value) : integer(value)
	return product(constant, ...nonNumberFactors)
}

export const mergeProductNumbers = defineRule({
	name: 'mergeProductNumbers',
	appliesTo: isProduct,
	transform,
})
