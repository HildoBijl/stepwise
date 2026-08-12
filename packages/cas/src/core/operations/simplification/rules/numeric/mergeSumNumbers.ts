import { sum as arraySum, splitArray } from '@step-wise/utils'

import { type ExpressionNode, type Sum, integer, float, sum } from '../../../../construction'

import { isSum, isConstant, isFloat, numericNodeToNumber } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: Sum): ExpressionNode {
	const [constants, nonConstants] = splitArray(node.terms, isConstant)
	if (constants.length <= 1) return node
	const value = arraySum(constants.map(term => numericNodeToNumber(term)))
	return sum(...nonConstants, constants.some(isFloat) ? float(value) : integer(value))
}

export const mergeSumNumbers = defineRule({
	name: 'mergeSumNumbers',
	appliesTo: isSum,
	transform,
})
