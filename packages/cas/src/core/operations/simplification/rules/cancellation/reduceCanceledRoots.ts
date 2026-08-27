import { type ExpressionNode, type Power, type RootFunction } from '../../../../construction'

import { isPower, isRootFunction, areNodesEqual } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: RootFunction | Power): ExpressionNode {
	if (isRootFunction(node) && isPower(node.radicand) && areNodesEqual(node.radicand.exponent, node.degree)) return node.radicand.base
	if (isPower(node) && isRootFunction(node.base) && areNodesEqual(node.base.degree, node.exponent)) return node.base.radicand
	return node
}

export const reduceCanceledRoots = defineRule({
	name: 'reduceCanceledRoots',
	appliesTo: (node): node is Parameters<typeof transform>[0] => isRootFunction(node) || isPower(node),
	transform,
})
