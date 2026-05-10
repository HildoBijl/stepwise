
import { type ExpressionNode, Integer, Sum } from '../../../../construction'

export function removeTrivialSums(node: Sum): ExpressionNode {
	if (node.terms.length === 0) return Integer.zero
	if (node.terms.length === 1) return node.terms[0]
	return node
}
