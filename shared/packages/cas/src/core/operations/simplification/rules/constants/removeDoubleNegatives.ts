import { Sign, type ExpressionNode } from '../../../../construction'

import { isSignNode } from '../../../structural'

export function removeDoubleNegatives(node: Sign): ExpressionNode {
	if (!isSignNode(node.node)) return node
	if (node.plusMinus || node.node.plusMinus) return node
	return node.negative && node.node.negative ? node.node.node : node
}
