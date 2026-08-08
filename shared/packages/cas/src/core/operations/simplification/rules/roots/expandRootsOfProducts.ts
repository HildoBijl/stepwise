import { isRootLike, isProduct } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type ExpressionNode, type RootLike, product } from '../../../../construction'

function transform(node: RootLike): ExpressionNode {
	return isProduct(node.radicand) ? product(...node.radicand.factors.map(factor => node.recreateWith(factor))) : node
}

export const expandRootsOfProducts = defineRule({
	appliesTo: isRootLike,
	transform,
})
