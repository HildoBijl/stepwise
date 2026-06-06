import { type ExpressionNode, type LogLike, Integer } from '../../../../construction'

import { isOne } from '../../../structural'

export function reduceLogarithmsWithOneArgument(node: LogLike): ExpressionNode {
	return isOne(node.argument) ? Integer.zero : node
}
