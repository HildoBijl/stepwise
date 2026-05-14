import { type ExpressionNode, type Power, fraction, power } from '../../../../construction'

import { isMinus } from '../../../structural'

export function convertNegativePowers(node: Power): ExpressionNode {
	return isMinus(node.exponent) ? fraction(1, power(node.base, node.exponent.node)) : node
}
