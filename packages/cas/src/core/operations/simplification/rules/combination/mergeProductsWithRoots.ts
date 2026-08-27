import { type ExpressionNode, type Product, Integer, product, fraction, power, root } from '../../../../construction'

import { isProduct, isRootFunction, areNodesEqual } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: Product): ExpressionNode {
	const newDegree = product(...node.factors.map(factor => isRootFunction(factor) ? factor.degree : undefined).filter(value => value !== undefined))
	if (areNodesEqual(newDegree, Integer.one)) return node
	return root(product(...node.factors.map(factor => isRootFunction(factor) ? power(factor.radicand, fraction(newDegree, factor.degree)) : power(factor, newDegree))), newDegree)
}

export const mergeProductsWithRoots = defineRule({
	name: 'mergeProductsWithRoots',
	appliesTo: isProduct,
	transform,
})
