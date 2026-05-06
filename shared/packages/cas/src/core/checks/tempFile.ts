import { ExpressionNode, Sum } from '../nodes'

export function isSum(node: ExpressionNode): node is Sum {
	return node instanceof Sum
}
