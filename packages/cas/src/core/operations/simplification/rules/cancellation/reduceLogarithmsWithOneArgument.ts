import { type ExpressionNode, type LogLike, Integer } from '../../../../construction'

import { isLogLike, isOne } from '../../../structural'

import { defineRule } from '../ruleDefinition'
import { hasValidLogarithmBase } from '../utils'

function transform(node: LogLike): ExpressionNode {
	return isOne(node.argument) && hasValidLogarithmBase(node) ? Integer.zero : node
}

export const reduceLogarithmsWithOneArgument = defineRule({
	name: 'reduceLogarithmsWithOneArgument',
	appliesTo: isLogLike,
	transform,
})
