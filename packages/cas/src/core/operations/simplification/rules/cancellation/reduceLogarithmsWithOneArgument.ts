import { type ExpressionNode, type LogarithmFunction, Integer } from '../../../../construction'

import { isLogarithmFunction, isOne } from '../../../structural'

import { defineRule } from '../ruleDefinition'
import { hasValidLogarithmBase } from '../utils'

function transform(node: LogarithmFunction): ExpressionNode {
	return isOne(node.argument) && hasValidLogarithmBase(node) ? Integer.zero : node
}

export const reduceLogarithmsWithOneArgument = defineRule({
	name: 'reduceLogarithmsWithOneArgument',
	appliesTo: isLogarithmFunction,
	transform,
})
