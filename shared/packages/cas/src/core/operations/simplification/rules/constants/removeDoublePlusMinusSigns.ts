import { Sign, type ExpressionNode } from '../../../../construction'

import { isSignNode } from '../../../structural'

export function removeDoublePlusMinusSigns(node: Sign): ExpressionNode {
	if (!isSignNode(node.node)) return node
	if (!node.plusMinus || !node.node.plusMinus) return node
	return new Sign(node.node.node, node.negative !== node.node.negative, true)
}
