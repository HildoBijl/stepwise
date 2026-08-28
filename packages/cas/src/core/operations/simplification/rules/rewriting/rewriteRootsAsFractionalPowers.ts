import { type ExpressionNode, type RootFunction, fraction, power } from '../../../../construction/index.ts'

import { isRootFunction } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: RootFunction): ExpressionNode {
	return power(node.radicand, fraction(1, node.degree))
}

export const rewriteRootsAsFractionalPowers = defineRule({
	name: 'rewriteRootsAsFractionalPowers',
	appliesTo: isRootFunction,
	transform,
})
