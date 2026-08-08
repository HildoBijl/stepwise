import { type ExpressionNode, type Power, integer, float, fraction, power } from '../../../../construction'

import { isPower, isNumberNode, isOne, isIntegerNode, isFraction } from '../../../structural'

import { defineRule } from '../utils'

export function applyReduceNumberPowers(node: Power): ExpressionNode {
	if (!isNumberNode(node.base)) return node
	if (isNumberNode(node.exponent)) return (isIntegerNode(node.base) && isIntegerNode(node.exponent) ? integer : float)(node.base.value ** node.exponent.value)
	if (isFraction(node.exponent) && isNumberNode(node.exponent.numerator) && !isOne(node.exponent.numerator)) return power(applyReduceNumberPowers(power(node.base, node.exponent.numerator)), fraction(1, node.exponent.denominator))
	return node
}

export const reduceNumberPowers = defineRule({
	appliesTo: isPower,
	transform: applyReduceNumberPowers,
	conflictsWith: ['factorizeIntegers'],
})
