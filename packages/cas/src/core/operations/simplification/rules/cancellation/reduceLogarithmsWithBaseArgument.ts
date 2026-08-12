import { type ExpressionNode, type LogLike, Integer } from '../../../../construction'

import { isLogLike, equalNodes } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: LogLike): ExpressionNode {
	return equalNodes(node.base, node.argument) ? Integer.one : node
}

export const reduceLogarithmsWithBaseArgument = defineRule({
	name: 'reduceLogarithmsWithBaseArgument',
	appliesTo: isLogLike,
	transform,
})
