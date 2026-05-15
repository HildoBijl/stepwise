import { type ExpressionNode, type Power, integer, float } from '../../../../construction'

import { isNumberNode, isIntegerNode } from '../../../structural'

export function mergePowerNumbers(node: Power): ExpressionNode {
	if (!isNumberNode(node.base) || !isNumberNode(node.exponent)) return node
	const value = node.base.value ** node.exponent.value
	return isIntegerNode(node.base) && isIntegerNode(node.exponent) ? integer(value) : float(value)
}
