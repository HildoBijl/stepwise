import { type ExpressionNode, type LogLike, Integer } from '../../../../construction'

import { isLogLike, equalNodes } from '../../../structural'

import { defineRule } from '../ruleDefinition'
import { hasValidLogarithmBase } from '../utils'

function transform(node: LogLike): ExpressionNode {
	return equalNodes(node.base, node.argument) && hasValidLogarithmBase(node) ? Integer.one : node
}

export const reduceLogarithmsWithBaseArgument = defineRule({
	name: 'reduceLogarithmsWithBaseArgument',
	appliesTo: isLogLike,
	transform,
})
