import { type ExpressionNode, type Power, fraction, power } from '../../../../construction'

import { isNegativeSign } from '../../../structural'

export function removeNegativePowers(node: Power): ExpressionNode {
	return isNegativeSign(node.exponent) ? fraction(1, power(node.base, node.exponent.node)) : node
}
