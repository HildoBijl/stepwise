import { type ExpressionNode, type RootLike, product } from '../../../../construction'

import { isRootLike, isProduct } from '../../../structural'

import { defineRule } from '../utils'

function transform(node: RootLike): ExpressionNode {
	return isProduct(node.radicand) ? product(...node.radicand.factors.map(factor => node.recreateWith(factor))) : node
}

export const expandRootsOfProducts = defineRule({
	appliesTo: isRootLike,
	transform,
	conflictsWith: ['mergeFractionFactors'],
})
