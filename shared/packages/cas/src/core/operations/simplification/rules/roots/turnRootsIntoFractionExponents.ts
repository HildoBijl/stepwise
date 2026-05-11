import { type ExpressionNode, fraction, power } from '../../../../construction'

import { type RootLike } from '../utils'

export function turnRootsIntoFractionExponents(node: RootLike): ExpressionNode {
	return power(node.argument, fraction(1, node.base))
}
