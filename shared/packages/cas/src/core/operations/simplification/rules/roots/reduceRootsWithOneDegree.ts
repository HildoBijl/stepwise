import { type ExpressionNode, type RootLike } from '../../../../construction'

import { isOne } from '../../../structural'

export function reduceRootsWithOneDegree(node: RootLike): ExpressionNode {
	return isOne(node.degree) ? node.radicand : node
}
