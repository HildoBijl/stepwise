import { type ExpressionNode, Integer } from '../../../../construction'

import { isZero } from '../../../structural'

import { type RootLike } from '../utils'

export function reduceRootsWithZeroArgument(node: RootLike): ExpressionNode {
	return isZero(node.argument) ? Integer.zero : node
}
