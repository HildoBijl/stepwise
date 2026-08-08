import { type ExpressionNode, type RootLike, Integer } from '../../../../construction'

import { isRootLike, isZero } from '../../../structural'

import { defineRule } from '../utils'

function transform(node: RootLike): ExpressionNode {
	return isZero(node.radicand) ? Integer.zero : node
}

export const reduceRootsWithZeroRadicand = defineRule({
	appliesTo: isRootLike,
	transform,
})
