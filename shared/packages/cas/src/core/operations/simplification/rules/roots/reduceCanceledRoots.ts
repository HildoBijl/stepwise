import { type ExpressionNode, type Power, type RootLike } from '../../../../construction'

import { isPower, isRootLike, equalNodes } from '../../../structural'

export function reduceCanceledRoots(node: RootLike | Power): ExpressionNode {
	if (isRootLike(node) && isPower(node.radicand) && equalNodes(node.radicand.exponent, node.degree)) return node.radicand.base
	if (isPower(node) && isRootLike(node.base) && equalNodes(node.base.degree, node.exponent)) return node.base.radicand
	return node
}
