import { type ExpressionNode, type Power, power, product } from '../../../../construction'

import { isPower } from '../../../structural'

export function removePowersWithinPowers(node: Power): ExpressionNode {
	return isPower(node.base) ? power(node.base.base, product(node.base.exponent, node.exponent)) : node
}
