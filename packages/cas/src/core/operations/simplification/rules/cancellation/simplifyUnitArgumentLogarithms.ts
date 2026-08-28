import { type ExpressionNode, type LogarithmFunction, Integer } from '../../../../construction/index.ts'

import { isLogarithmFunction, isOne } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'
import { hasValidLogarithmBase } from '../utils/index.ts'

function transform(node: LogarithmFunction): ExpressionNode {
	return isOne(node.argument) && hasValidLogarithmBase(node) ? Integer.zero : node
}

export const simplifyUnitArgumentLogarithms = defineRule({
	name: 'simplifyUnitArgumentLogarithms',
	appliesTo: isLogarithmFunction,
	transform,
})
