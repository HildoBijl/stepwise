import { isPower, isOne } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type ExpressionNode, type Power } from '../../../../construction'

function transform(node: Power): ExpressionNode {
	return isOne(node.exponent) ? node.base : node
}

export const removeOneExponentsFromPowers = defineRule({
	appliesTo: isPower,
	transform,
})
