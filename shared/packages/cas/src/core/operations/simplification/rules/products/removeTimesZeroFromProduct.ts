import { type ExpressionNode, type Product, Integer } from '../../../../construction'

import { isZero } from '../../../structural'

export function removeTimesZeroFromProduct(node: Product): ExpressionNode {
	return node.factors.some(isZero) ? Integer.zero : node
}
