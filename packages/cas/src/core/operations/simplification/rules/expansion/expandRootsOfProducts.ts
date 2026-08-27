import { type ExpressionNode, type RootFunction, product } from '../../../../construction'

import { isRootFunction, isProduct } from '../../../structural'

import { mergeFractionFactors, mergeProductsOfRoots, mergeProductsWithRoots } from '../combination'
import { defineRule } from '../ruleDefinition'

function transform(node: RootFunction): ExpressionNode {
	return isProduct(node.radicand) ? product(...node.radicand.factors.map(factor => node.recreateWith(factor))) : node
}

export const expandRootsOfProducts = defineRule({
	name: 'expandRootsOfProducts',
	appliesTo: isRootFunction,
	transform,
	conflictsWith: [mergeFractionFactors, mergeProductsOfRoots, mergeProductsWithRoots],
})
