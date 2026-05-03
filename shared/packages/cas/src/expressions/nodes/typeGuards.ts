import type { ExpressionNode } from './ExpressionNode'
import { Integer, PlusMinus } from './constants'

export function isMinusOne(node: ExpressionNode): boolean {
	return node instanceof Integer && node.value === -1
}

export function isPlusMinus(node: ExpressionNode): boolean {
	return node instanceof PlusMinus
}
