import { type ExpressionNode, Integer } from '../../../../construction'

import { isOne } from '../../../structural'

import { type RootLike } from '../utils'

export function reduceRootsWithOneArgument(node: RootLike): ExpressionNode {
	return isOne(node.argument) ? Integer.one : node
}
