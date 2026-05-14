import type { ExpressionNode, Minus } from '../../../../construction'

import { isMinus } from '../../../structural'

export function removeDoubleNegatives(node: Minus): ExpressionNode {
	return isMinus(node.node) ? node.node.node : node
}
