import { type ExpressionNode, type RootLike } from '../../../../construction'

import { isRootLike, isOne } from '../../../structural'

import { defineRule } from '../utils'

function transform(node: RootLike): ExpressionNode {
	return isOne(node.degree) ? node.radicand : node
}

export const reduceRootsWithOneDegree = defineRule({
	appliesTo: isRootLike,
	transform,
})
