import { isPower, isIntegerNode, isMinus } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type ExpressionNode, type Power, negative, power } from '../../../../construction'

function transform(node: Power): ExpressionNode {
	if (!isMinus(node.base) || !isIntegerNode(node.exponent)) return node
	const powerWithoutMinus = power(node.base.node, node.exponent)
	return node.exponent.value % 2 === 0 ? powerWithoutMinus : negative(powerWithoutMinus)
}

export const mergePowerMinuses = defineRule({
	appliesTo: isPower,
	transform,
})
