import { isPower, isRootLike, equalNodes } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type ExpressionNode, type Power, type RootLike } from '../../../../construction'

function transform(node: RootLike | Power): ExpressionNode {
	if (isRootLike(node) && isPower(node.radicand) && equalNodes(node.radicand.exponent, node.degree)) return node.radicand.base
	if (isPower(node) && isRootLike(node.base) && equalNodes(node.base.degree, node.exponent)) return node.base.radicand
	return node
}

export const reduceCanceledRoots = defineRule({
	appliesTo: (node): node is Parameters<typeof transform>[0] => isRootLike(node) || isPower(node),
	transform,
})
