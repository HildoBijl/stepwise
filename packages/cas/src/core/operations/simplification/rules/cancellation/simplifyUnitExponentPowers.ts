import { type ExpressionNode, type Power } from '../../../../construction'

import { isPower, isOne } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: Power): ExpressionNode {
	return isOne(node.exponent) ? node.base : node
}

export const simplifyUnitExponentPowers = defineRule({
	name: 'simplifyUnitExponentPowers',
	appliesTo: isPower,
	transform,
})
