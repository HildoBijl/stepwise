import { type ExpressionNode, type Product, product, sum } from '../../../../construction'

import { isSum } from '../../../structural'

export function expandProductsOfSums(node: Product): ExpressionNode {
	const index = node.factors.findIndex(isSum)
	if (index === -1) return node
	const sumFactor = node.factors[index]
	if (!isSum(sumFactor)) return node
	return sum(...sumFactor.terms.map(term => product(...node.factors.slice(0, index), term, ...node.factors.slice(index + 1))))
}
