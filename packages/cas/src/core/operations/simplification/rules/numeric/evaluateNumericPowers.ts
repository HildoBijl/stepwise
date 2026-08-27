import { type ExpressionNode, type Power, integer, float, fraction, power } from '../../../../construction'

import { isPower, isNumberNode, isOne, isInteger, isFloat, isFraction, evaluateNumericNode, tryToEvaluateNumericNode } from '../../../structural'

import { defineRule } from '../ruleDefinition'

export function applyReduceNumberPowers(node: Power): ExpressionNode {
	if (!isInteger(node.base) && !isFloat(node.base)) return node
	if (isInteger(node.exponent) || isFloat(node.exponent)) {
		const value = tryToEvaluateNumericNode(node)
		if (value === undefined) return node
		return (isInteger(node.base) && isInteger(node.exponent) && Number.isInteger(value) ? integer : float)(value)
	}
	if (isFraction(node.exponent) && evaluateNumericNode(node.base) >= 0 && isNumberNode(node.exponent.numerator) && !isOne(node.exponent.numerator)) return power(applyReduceNumberPowers(power(node.base, node.exponent.numerator)), fraction(1, node.exponent.denominator))
	return node
}

export const evaluateNumericPowers = defineRule({
	name: 'evaluateNumericPowers',
	appliesTo: isPower,
	transform: applyReduceNumberPowers,
})
