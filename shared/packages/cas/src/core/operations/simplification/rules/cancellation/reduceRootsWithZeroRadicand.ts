import { type ExpressionNode, type RootLike, Integer } from '../../../../construction'

import { isRootLike, isZero } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: RootLike): ExpressionNode {
	return isZero(node.radicand) ? Integer.zero : node
}

export const reduceRootsWithZeroRadicand = defineRule({
	name: 'reduceRootsWithZeroRadicand',
	appliesTo: isRootLike,
	transform,
})
