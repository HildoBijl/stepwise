import { sum as arraySum, partition } from '@step-wise/js-utils'

import { type ExpressionNode, type Sum, integer, float, sum } from '../../../../construction/index.ts'

import { isSum, isConstant, isFloat, tryToEvaluateNumericNode } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Sum): ExpressionNode {
	const [constants, nonConstants] = partition(node.terms, isConstant)
	if (constants.length <= 1) return node
	const values = constants.map(term => tryToEvaluateNumericNode(term))
	if (!values.every((value): value is number => value !== undefined)) return node
	const value = arraySum(values)
	return sum(...nonConstants, constants.some(isFloat) ? float(value) : integer(value))
}

export const combineNumbersInSums = defineRule({
	name: 'combineNumbersInSums',
	appliesTo: isSum,
	transform,
})
