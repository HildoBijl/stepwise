import { type ExpressionNode, type RootLike } from '../../../../construction'

import { isRootLike, isOne } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: RootLike): ExpressionNode {
	return isOne(node.degree) ? node.radicand : node
}

export const reduceRootsWithOneDegree = defineRule({
	name: 'reduceRootsWithOneDegree',
	appliesTo: isRootLike,
	transform,
})
