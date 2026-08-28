import { type ExpressionNode, type Power, root, power } from '../../../../construction/index.ts'

import { isPower, isFraction } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

import { rewriteRootsAsFractionalPowers } from './rewriteRootsAsFractionalPowers.ts'

function transform(node: Power): ExpressionNode {
	if (!isFraction(node.exponent)) return node
	return root(power(node.base, node.exponent.numerator), node.exponent.denominator)
}

export const rewriteFractionalPowersAsRoots = defineRule({
	name: 'rewriteFractionalPowersAsRoots',
	appliesTo: isPower,
	transform,
	conflictsWith: [rewriteRootsAsFractionalPowers],
})
