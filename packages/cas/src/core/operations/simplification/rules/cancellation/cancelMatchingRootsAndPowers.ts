import { type ExpressionNode, type Power, type RootFunction } from '../../../../construction/index.ts'

import { isPower, isRootFunction, areNodesEqual } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: RootFunction | Power): ExpressionNode {
	if (isRootFunction(node) && isPower(node.radicand) && areNodesEqual(node.radicand.exponent, node.degree)) return node.radicand.base
	if (isPower(node) && isRootFunction(node.base) && areNodesEqual(node.base.degree, node.exponent)) return node.base.radicand
	return node
}

export const cancelMatchingRootsAndPowers = defineRule({
	name: 'cancelMatchingRootsAndPowers',
	appliesTo: (node): node is Parameters<typeof transform>[0] => isRootFunction(node) || isPower(node),
	transform,
})
