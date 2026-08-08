import { isPower, isIntegerNode } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { repeat } from '@step-wise/utils'

import { type ExpressionNode, type Power, product } from '../../../../construction'

function transform(node: Power): ExpressionNode {
	if (!isIntegerNode(node.exponent)) return node
	return product(...repeat(node.exponent.value, () => node.base))
}

export const expandPowers = defineRule({
	appliesTo: isPower,
	transform,
})
