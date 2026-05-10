import { type Sign, type Product, negative, product } from '../../../../construction'

import { isNegativeSignNode } from '../../../structural'

export function mergeProductMinuses(node: Product): Product | Sign {
	// Check the number of minus signs.
	let negativeCount = 0
	const factors = node.factors.map(factor => {
		if (!isNegativeSignNode(factor)) return factor
		negativeCount++
		return factor.node
	})
	if (negativeCount === 0) return node

	// Apply a minus to the product.
	const result = product(...factors) as Product
	return negativeCount % 2 === 0 ? result : negative(result)
}
