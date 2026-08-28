import { type ExpressionNode, type Minus } from '../../../../construction/index.ts'

import { isMinus } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

export function applyRemoveDoubleNegatives(node: Minus): ExpressionNode {
	return isMinus(node.node) ? node.node.node : node
}

export const removeDoubleNegatives = defineRule({
	name: 'removeDoubleNegatives',
	appliesTo: isMinus,
	transform: applyRemoveDoubleNegatives,
})
