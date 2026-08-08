import { type ExpressionNode, type Power, root, power } from '../../../../construction'

import { isPower, isFraction } from '../../../structural'

import { defineRule } from '../utils'

function transform(node: Power): ExpressionNode {
	if (!isFraction(node.exponent)) return node
	return root(power(node.base, node.exponent.numerator), node.exponent.denominator)
}

export const turnFractionExponentsIntoRoots = defineRule({
	appliesTo: isPower,
	transform,
})
