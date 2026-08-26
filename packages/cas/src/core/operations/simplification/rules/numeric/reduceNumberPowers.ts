import { type ExpressionNode, type Power, integer, float, fraction, power } from '../../../../construction'

import { isPower, isNumberNode, isOne, isInteger, isFloat, isFraction, numericNodeToNumber, tryNumericNodeToNumber } from '../../../structural'

import { defineRule } from '../ruleDefinition'

export function applyReduceNumberPowers(node: Power): ExpressionNode {
	if (!isInteger(node.base) && !isFloat(node.base)) return node
	if (isInteger(node.exponent) || isFloat(node.exponent)) {
		const value = tryNumericNodeToNumber(node)
		if (value === undefined) return node
		return (isInteger(node.base) && isInteger(node.exponent) && Number.isInteger(value) ? integer : float)(value)
	}
	if (isFraction(node.exponent) && numericNodeToNumber(node.base) >= 0 && isNumberNode(node.exponent.numerator) && !isOne(node.exponent.numerator)) return power(applyReduceNumberPowers(power(node.base, node.exponent.numerator)), fraction(1, node.exponent.denominator))
	return node
}

export const reduceNumberPowers = defineRule({
	name: 'reduceNumberPowers',
	appliesTo: isPower,
	transform: applyReduceNumberPowers,
})
