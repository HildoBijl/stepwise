import { type ExpressionNode, type Minus } from '../../../../construction'

import { isMinus } from '../../../structural'

import { defineRule } from '../ruleDefinition'

export function applyRemoveDoubleNegatives(node: Minus): ExpressionNode {
	return isMinus(node.node) ? node.node.node : node
}

export const removeDoubleNegatives = defineRule({
	name: 'removeDoubleNegatives',
	appliesTo: isMinus,
	transform: applyRemoveDoubleNegatives,
})
