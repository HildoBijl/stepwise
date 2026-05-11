import { type ExpressionNode, type Power, negative, power } from '../../../../construction'

import { isIntegerNode, isNegativeSign } from '../../../structural'

export function mergePowerMinuses(node: Power): ExpressionNode {
	if (!isNegativeSign(node.base) || !isIntegerNode(node.exponent)) return node
	const result = power(node.base.node, node.exponent)
	return node.exponent.value % 2 === 0 ? result : negative(result)
}
