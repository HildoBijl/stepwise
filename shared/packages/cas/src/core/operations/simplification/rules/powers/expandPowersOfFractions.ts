import { type ExpressionNode, type Power, fraction, power } from '../../../../construction'

import { isFraction } from '../../../structural'

export function expandPowersOfFractions(node: Power): ExpressionNode {
	return isFraction(node.base) ? fraction(power(node.base.numerator, node.exponent), power(node.base.denominator, node.exponent)) : node
}
