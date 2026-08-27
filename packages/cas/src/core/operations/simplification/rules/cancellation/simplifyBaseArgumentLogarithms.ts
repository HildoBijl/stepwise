import { type ExpressionNode, type LogarithmFunction, Integer } from '../../../../construction'

import { isLogarithmFunction, areNodesEqual } from '../../../structural'

import { defineRule } from '../ruleDefinition'
import { hasValidLogarithmBase } from '../utils'

function transform(node: LogarithmFunction): ExpressionNode {
	return areNodesEqual(node.base, node.argument) && hasValidLogarithmBase(node) ? Integer.one : node
}

export const simplifyBaseArgumentLogarithms = defineRule({
	name: 'simplifyBaseArgumentLogarithms',
	appliesTo: isLogarithmFunction,
	transform,
})
