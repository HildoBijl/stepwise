import { sum as arraySum, partition } from '@step-wise/js-utils'

import { type ExpressionNode, type Sum, integer, float, sum } from '../../../../construction'

import { isSum, isConstant, isFloat, tryNumericNodeToNumber } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: Sum): ExpressionNode {
	const [constants, nonConstants] = partition(node.terms, isConstant)
	if (constants.length <= 1) return node
	const values = constants.map(term => tryNumericNodeToNumber(term))
	if (!values.every((value): value is number => value !== undefined)) return node
	const value = arraySum(values)
	return sum(...nonConstants, constants.some(isFloat) ? float(value) : integer(value))
}

export const mergeSumNumbers = defineRule({
	name: 'mergeSumNumbers',
	appliesTo: isSum,
	transform,
})
