import { sum as arraySum, splitArray } from '@step-wise/utils'

import { type ExpressionNode, type Sum, integer, float, sum } from '../../../../construction'

import { isConstant, isFloat, numericNodeToNumber } from '../../../structural'

export function mergeSumNumbers(node: Sum): ExpressionNode {
	const [constants, nonConstants] = splitArray(node.terms, isConstant)
	if (constants.length <= 1) return node
	const value = arraySum(constants.map(term => numericNodeToNumber(term)))
	return sum(...nonConstants, constants.some(isFloat) ? float(value) : integer(value))
}
