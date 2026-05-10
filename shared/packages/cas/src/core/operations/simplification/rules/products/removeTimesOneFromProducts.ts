import { type ExpressionNode, type Product, product } from '../../../../construction'

import { isOne } from '../../../structural'

export function removeTimesOneFromProducts(node: Product): ExpressionNode {
	const factors = node.factors.filter(factor => !isOne(factor))
	return factors.length === node.factors.length ? node : product(...factors)
}
