import { type ExpressionNode, type RootLike, product } from '../../../../construction'

import { isRootLike, isProduct } from '../../../structural'

import { mergeFractionFactors, mergeProductsOfRoots, mergeProductsWithRoots } from '../combination'
import { defineRule } from '../ruleDefinition'

function transform(node: RootLike): ExpressionNode {
	return isProduct(node.radicand) ? product(...node.radicand.factors.map(factor => node.recreateWith(factor))) : node
}

export const expandRootsOfProducts = defineRule({
	name: 'expandRootsOfProducts',
	appliesTo: isRootLike,
	transform,
	conflictsWith: [mergeFractionFactors, mergeProductsOfRoots, mergeProductsWithRoots],
})
