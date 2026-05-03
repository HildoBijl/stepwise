import { type ExpressionNode, Constant } from '../nodes'

export function isConstant(node: ExpressionNode): boolean {
	return node instanceof Constant
}
