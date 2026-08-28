import { type ExpressionNode, type Product, product, sum } from '../../../../construction/index.ts'

import { isProduct, isSum } from '../../../structural/index.ts'

import { cancelFractionFactors } from '../cancellation/index.ts'
import { combineFractionFactors } from '../combination/index.ts'
import { defineRule } from '../ruleDefinition.ts'

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
	after: [cancelFractionFactors, combineFractionFactors],
})
