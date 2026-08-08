import { isRootLike, isZero } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type ExpressionNode, type RootLike, Integer } from '../../../../construction'

function transform(node: RootLike): ExpressionNode {
	return isZero(node.radicand) ? Integer.zero : node
}

export const reduceRootsWithZeroRadicand = defineRule({
	appliesTo: isRootLike,
	transform,
})
