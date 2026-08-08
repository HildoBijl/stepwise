import { type ExpressionNode, type LogLike, Integer } from '../../../../construction'

import { isLogLike, equalNodes } from '../../../structural'

import { defineRule } from '../utils'

function transform(node: LogLike): ExpressionNode {
	return equalNodes(node.base, node.argument) ? Integer.one : node
}

export const reduceLogarithmsWithBaseArgument = defineRule({
	appliesTo: isLogLike,
	transform,
})
