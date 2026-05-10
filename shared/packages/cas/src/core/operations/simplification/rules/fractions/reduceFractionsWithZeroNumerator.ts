import { type ExpressionNode, type Fraction } from '../../../../construction'

import { isZero } from '../../../structural'

export function reduceFractionsWithZeroNumerator(node: Fraction): ExpressionNode {
	return isZero(node.numerator) ? node.numerator : node
}
