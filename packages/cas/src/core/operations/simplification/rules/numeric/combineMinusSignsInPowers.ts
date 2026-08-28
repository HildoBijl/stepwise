import { type ExpressionNode, type Power, negative, power } from '../../../../construction/index.ts'

import { isPower, isIntegerNode, isMinus } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Power): ExpressionNode {
	if (!isMinus(node.base) || !isIntegerNode(node.exponent)) return node
	const powerWithoutMinus = power(node.base.node, node.exponent)
	return node.exponent.value % 2 === 0 ? powerWithoutMinus : negative(powerWithoutMinus)
}

export const combineMinusSignsInPowers = defineRule({
	name: 'combineMinusSignsInPowers',
	appliesTo: isPower,
	transform,
})
