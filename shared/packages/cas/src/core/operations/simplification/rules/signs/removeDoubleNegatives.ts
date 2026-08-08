import { isMinus } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import type { ExpressionNode, Minus } from '../../../../construction'

export function applyRemoveDoubleNegatives(node: Minus): ExpressionNode {
	return isMinus(node.node) ? node.node.node : node
}

export const removeDoubleNegatives = defineRule({
	appliesTo: isMinus,
	transform: applyRemoveDoubleNegatives,
})
