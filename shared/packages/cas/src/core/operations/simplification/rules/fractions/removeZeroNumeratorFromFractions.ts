import { type ExpressionNode, type Fraction } from '../../../../construction'

import { isZero } from '../../../structural'

export function removeZeroNumeratorFromFractions(node: Fraction): ExpressionNode {
	return isZero(node.numerator) ? node.numerator : node
}
