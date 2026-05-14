import { type Power, type ExpressionNode } from '../../../../construction'

import { equalNodes, isPower } from '../../../structural'

import { type RootLike, isRootLike } from '../utils'

export function reduceCanceledRoots(node: RootLike | Power): ExpressionNode {
	if (isRootLike(node) && isPower(node.argument) && equalNodes(node.argument.exponent, node.base)) return node.argument.base
	if (isPower(node) && isRootLike(node.base) && equalNodes(node.base.base, node.exponent)) return node.base.argument
	return node
}
