import { type ExpressionNode, type Power, root, power } from '../../../../construction'

import { isFraction } from '../../../structural'

export function turnFractionExponentsIntoRoots(node: Power): ExpressionNode {
	if (!isFraction(node.exponent)) return node
	return root(power(node.base, node.exponent.numerator), node.exponent.denominator)
}
