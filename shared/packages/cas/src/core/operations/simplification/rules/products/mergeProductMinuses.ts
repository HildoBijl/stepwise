import { type SignNode, type Product, negative, product } from '../../../../construction'

import { isMinus } from '../../../structural'

export function mergeProductMinuses(node: Product): Product | SignNode {
	// Remove all minus signs from the factors. Count them.
	let negativeCount = 0
	const factors = node.factors.map(factor => {
		if (!isMinus(factor)) return factor
		negativeCount++
		return factor.node
	})
	if (negativeCount === 0) return node

	// Apply a minus to the product.
	const result = product(...factors) as Product
	return negativeCount % 2 === 0 ? result : negative(result)
}
