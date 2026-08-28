import { type ExpressionNode, type RootFunction, product } from '../../../../construction/index.ts'

import { isRootFunction, isProduct } from '../../../structural/index.ts'

import { combineFractionFactors, combineRootsInProducts, combineProductsWithRoots } from '../combination/index.ts'
import { defineRule } from '../ruleDefinition.ts'

function transform(node: RootFunction): ExpressionNode {
	return isProduct(node.radicand) ? product(...node.radicand.factors.map(factor => node.recreateWith(factor))) : node
}

export const expandRootsOfProducts = defineRule({
	name: 'expandRootsOfProducts',
	appliesTo: isRootFunction,
	transform,
	conflictsWith: [combineFractionFactors, combineRootsInProducts, combineProductsWithRoots],
})
