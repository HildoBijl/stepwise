import { type ExpressionNode, type Power } from '../../../../construction/index.ts'

import { isPower, isOne } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Power): ExpressionNode {
	return isOne(node.exponent) ? node.base : node
}

export const simplifyUnitExponentPowers = defineRule({
	name: 'simplifyUnitExponentPowers',
	appliesTo: isPower,
	transform,
})
