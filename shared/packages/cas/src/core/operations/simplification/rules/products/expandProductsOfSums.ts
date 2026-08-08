import { isProduct, isSum } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type ExpressionNode, type Product, product, sum } from '../../../../construction'

function transform(node: Product): ExpressionNode {
	const index = node.factors.findIndex(isSum)
	if (index === -1) return node
	const sumFactor = node.factors[index]
	if (!isSum(sumFactor)) return node
	return sum(...sumFactor.terms.map(term => product(...node.factors.slice(0, index), term, ...node.factors.slice(index + 1))))
}

export const expandProductsOfSums = defineRule({
	appliesTo: isProduct,
	transform,
})
