import { type ExpressionNode, type RootLike, Integer } from '../../../../construction'

import { isRootLike, isOne } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: RootLike): ExpressionNode {
	return isOne(node.radicand) ? Integer.one : node
}

export const reduceRootsWithOneRadicand = defineRule({
	name: 'reduceRootsWithOneRadicand',
	appliesTo: isRootLike,
	transform,
})
