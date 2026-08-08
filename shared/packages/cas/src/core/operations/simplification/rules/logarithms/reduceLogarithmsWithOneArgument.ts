import { isLogLike, isOne } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type ExpressionNode, type LogLike, Integer } from '../../../../construction'

function transform(node: LogLike): ExpressionNode {
	return isOne(node.argument) ? Integer.zero : node
}

export const reduceLogarithmsWithOneArgument = defineRule({
	appliesTo: isLogLike,
	transform,
})
