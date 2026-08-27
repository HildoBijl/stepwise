import { type ExpressionNode, type Power, root, power } from '../../../../construction'

import { isPower, isFraction } from '../../../structural'

import { defineRule } from '../ruleDefinition'

import { rewriteRootsAsFractionalPowers } from './rewriteRootsAsFractionalPowers'

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
