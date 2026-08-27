import { type ExpressionNode, type RootFunction, fraction, power } from '../../../../construction'

import { isRootFunction } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: RootFunction): ExpressionNode {
	return power(node.radicand, fraction(1, node.degree))
}

export const rewriteRootsAsFractionalPowers = defineRule({
	name: 'rewriteRootsAsFractionalPowers',
	appliesTo: isRootFunction,
	transform,
})
