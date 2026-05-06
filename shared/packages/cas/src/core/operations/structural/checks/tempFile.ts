import { ExpressionNode, Sum } from '../../../construction'

export function isSum(node: ExpressionNode): node is Sum {
	return node instanceof Sum
}
