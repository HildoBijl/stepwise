import { type ExpressionNode, type RootLike, Integer } from '../../../../construction'

import { isOne } from '../../../structural'

export function reduceRootsWithOneRadicand(node: RootLike): ExpressionNode {
	return isOne(node.radicand) ? Integer.one : node
}
