import { isRootLike, isOne } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type ExpressionNode, type RootLike } from '../../../../construction'

function transform(node: RootLike): ExpressionNode {
	return isOne(node.degree) ? node.radicand : node
}

export const reduceRootsWithOneDegree = defineRule({
	appliesTo: isRootLike,
	transform,
})
