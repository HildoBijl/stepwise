import { type Variable } from '../../../construction'

// Given two variables, check which should appear earlier in a sum.
export function compareVariableNodes(a: Variable, b: Variable): number {
	const symbolOrder = a.symbol.localeCompare(b.symbol)
	if (symbolOrder !== 0) return symbolOrder
	const subscriptOrder = (a.subscript ?? '').localeCompare(b.subscript ?? '')
	if (subscriptOrder !== 0) return subscriptOrder
	return (a.accent ?? '').localeCompare(b.accent ?? '')
}
