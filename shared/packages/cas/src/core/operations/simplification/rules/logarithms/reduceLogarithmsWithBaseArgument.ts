import { type ExpressionNode, type LogLike, Integer } from '../../../../construction'

import { equalNodes } from '../../../structural'

export function reduceLogarithmsWithBaseArgument(node: LogLike): ExpressionNode {
	return equalNodes(node.base, node.argument) ? Integer.one : node
}
