import { type ExpressionNode, type RootLike, Integer } from '../../../../construction'

import { isZero } from '../../../structural'

export function reduceRootsWithZeroRadicand(node: RootLike): ExpressionNode {
	return isZero(node.radicand) ? Integer.zero : node
}
