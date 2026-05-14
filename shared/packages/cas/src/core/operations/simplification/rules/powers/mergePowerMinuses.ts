import { type ExpressionNode, type Power, negative, power } from '../../../../construction'

import { isIntegerNode, isMinus } from '../../../structural'

export function mergePowerMinuses(node: Power): ExpressionNode {
	if (!isMinus(node.base) || !isIntegerNode(node.exponent)) return node
	const powerWithoutMinus = power(node.base.node, node.exponent)
	return node.exponent.value % 2 === 0 ? powerWithoutMinus : negative(powerWithoutMinus)
}
