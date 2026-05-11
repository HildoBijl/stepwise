import { type ExpressionNode, type Power } from '../../../../construction'

import { isOne } from '../../../structural'

export function removeOneExponentFromPowers(node: Power): ExpressionNode {
	return isOne(node.exponent) ? node.base : node
}
