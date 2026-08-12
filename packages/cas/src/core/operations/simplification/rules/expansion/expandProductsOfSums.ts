import { type ExpressionNode, type Product, product, sum } from '../../../../construction'

import { isProduct, isSum } from '../../../structural'

import { cancelFractionFactors } from '../cancellation'
import { mergeFractionFactors } from '../combination'
import { defineRule } from '../ruleDefinition'

function transform(node: Product): ExpressionNode {
	const index = node.factors.findIndex(isSum)
	if (index === -1) return node
	const sumFactor = node.factors[index]
	if (!isSum(sumFactor)) return node
	return sum(...sumFactor.terms.map(term => product(...node.factors.slice(0, index), term, ...node.factors.slice(index + 1))))
}

export const expandProductsOfSums = defineRule({
	name: 'expandProductsOfSums',
	appliesTo: isProduct,
	transform,
	after: [cancelFractionFactors, mergeFractionFactors],
})
