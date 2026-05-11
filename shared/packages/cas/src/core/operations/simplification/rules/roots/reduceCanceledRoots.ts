import { type Power, type ExpressionNode } from '../../../../construction'

import { equalNodes, isPower } from '../../../structural'

import { type RootLike, isRootLike } from '../utils'

export function reduceCanceledRoots(node: RootLike | Power): ExpressionNode {
	if (isRootLike(node) && isPower(node.argument) && equalNodes(node.argument.exponent, node.base, { allowOrderChanges: true })) return node.argument.base
	if (isPower(node) && isRootLike(node.base) && equalNodes(node.base.base, node.exponent, { allowOrderChanges: true })) return node.base.argument
	return node
}
