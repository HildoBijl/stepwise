import { repeat } from '@step-wise/js-utils'

import { type ExpressionNode, type Power, product } from '../../../../construction'

import { isPower, isIntegerNode } from '../../../structural'

import { combineLikeFactors } from '../combination'
import { defineRule } from '../ruleDefinition'

function transform(node: Power): ExpressionNode {
	if (!isIntegerNode(node.exponent)) return node
	return product(...repeat(node.exponent.value, () => node.base))
}

export const expandPowers = defineRule({
	name: 'expandPowers',
	appliesTo: isPower,
	transform,
	conflictsWith: [combineLikeFactors],
})
