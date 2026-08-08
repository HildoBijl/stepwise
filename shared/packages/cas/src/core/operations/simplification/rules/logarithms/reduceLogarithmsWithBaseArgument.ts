import { isLogLike, equalNodes } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type ExpressionNode, type LogLike, Integer } from '../../../../construction'

function transform(node: LogLike): ExpressionNode {
	return equalNodes(node.base, node.argument) ? Integer.one : node
}

export const reduceLogarithmsWithBaseArgument = defineRule({
	appliesTo: isLogLike,
	transform,
})
