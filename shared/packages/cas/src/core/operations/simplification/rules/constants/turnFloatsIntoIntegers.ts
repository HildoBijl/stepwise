import { compareNumbers } from '@step-wise/utils'

import { type ExpressionNode, integer, Float } from '../../../../construction'

export function turnFloatsIntoIntegers(node: Float): ExpressionNode {
	const rounded = Math.round(node.value)
	return compareNumbers(node.value, rounded) ? integer(rounded) : node
}
