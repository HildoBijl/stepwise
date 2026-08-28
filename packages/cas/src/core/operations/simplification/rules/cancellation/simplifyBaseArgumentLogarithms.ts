import { type ExpressionNode, type LogarithmFunction, Integer } from '../../../../construction/index.ts'

import { isLogarithmFunction, areNodesEqual } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'
import { hasValidLogarithmBase } from '../utils/index.ts'

function transform(node: LogarithmFunction): ExpressionNode {
	return areNodesEqual(node.base, node.argument) && hasValidLogarithmBase(node) ? Integer.one : node
}

export const simplifyBaseArgumentLogarithms = defineRule({
	name: 'simplifyBaseArgumentLogarithms',
	appliesTo: isLogarithmFunction,
	transform,
})
