import { type ExpressionNode, type Product, product } from '../../../../construction'

import { isProduct } from '../../../structural'

export function flattenProducts(node: Product): ExpressionNode {
	const factors = node.factors.flatMap(factor => isProduct(factor) ? factor.factors : [factor])
	return factors.length === node.factors.length ? node : product(...factors)
}
