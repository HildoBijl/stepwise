import { type ExpressionNode, type Product, Integer, product, fraction, power, root } from '../../../../construction'

import { isRootLike, equalNodes } from '../../../structural'

export function mergeProductsWithRoots(node: Product): ExpressionNode {
	const newDegree = product(...node.factors.map(factor => isRootLike(factor) ? factor.degree : undefined).filter(value => value !== undefined))
	if (equalNodes(newDegree, Integer.one)) return node
	return root(product(...node.factors.map(factor => isRootLike(factor) ? power(factor.radicand, fraction(newDegree, factor.degree)) : power(factor, newDegree))), newDegree)
}
