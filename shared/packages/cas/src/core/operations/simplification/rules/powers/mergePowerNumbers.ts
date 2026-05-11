import { type ExpressionNode, type Power } from '../../../../construction'

import { isConstantNode, isIntegerNode } from '../../../structural'

export function mergePowerNumbers(node: Power): ExpressionNode {
	if (!isConstantNode(node.base) || !isIntegerNode(node.exponent)) return node
	return node.base.recreateWith(node.base.value ** node.exponent.value)
}
