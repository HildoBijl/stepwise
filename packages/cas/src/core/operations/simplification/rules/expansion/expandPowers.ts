import { repeat } from '@step-wise/js-utils'

import { type ExpressionNode, type Power, product } from '../../../../construction/index.ts'

import { isPower, isIntegerNode } from '../../../structural/index.ts'

import { combineLikeFactors } from '../combination/index.ts'
import { defineRule } from '../ruleDefinition.ts'

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
