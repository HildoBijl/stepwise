import { type ExpressionNode, type Power, power, product } from '../../../../construction/index.ts'

import { isPower } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Power): ExpressionNode {
	return isPower(node.base) ? power(node.base.base, product(node.base.exponent, node.exponent)) : node
}

export const flattenNestedPowers = defineRule({
	name: 'flattenNestedPowers',
	appliesTo: isPower,
	transform,
})
