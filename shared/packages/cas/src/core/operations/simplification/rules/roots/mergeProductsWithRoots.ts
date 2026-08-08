import { isProduct, isRootLike, equalNodes } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type ExpressionNode, type Product, Integer, product, fraction, power, root } from '../../../../construction'

function transform(node: Product): ExpressionNode {
	const newDegree = product(...node.factors.map(factor => isRootLike(factor) ? factor.degree : undefined).filter(value => value !== undefined))
	if (equalNodes(newDegree, Integer.one)) return node
	return root(product(...node.factors.map(factor => isRootLike(factor) ? power(factor.radicand, fraction(newDegree, factor.degree)) : power(factor, newDegree))), newDegree)
}

export const mergeProductsWithRoots = defineRule({
	appliesTo: (node, context): node is Parameters<typeof transform>[0] => isProduct(node) && !context.simplificationOptions.has('expandRootsOfProducts'),
	transform,
})
