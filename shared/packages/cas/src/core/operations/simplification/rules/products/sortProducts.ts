import { type ExpressionNode, type Product, product } from '../../../../construction'

import { isConstantNode, isVariable, isPower, isSum, isNumeric, numericNodeToNumber, getVariables } from '../../../structural'

import { compareVariableNodes } from '../utils'

export function sortProducts(node: Product): ExpressionNode {
	const factors = [...node.factors].sort(orderProductFactors)
	return factors.every((factor, index) => factor === node.factors[index]) ? node : product(...factors)
}

// Sorting function that determines which of two expressions should come first.
function orderProductFactors(a: ExpressionNode, b: ExpressionNode): number {
	// First sort by type.
	const tests = [isConstantNode, isNumeric, (node: ExpressionNode) => isVariable(node) || isPower(node), isSum, () => true]
	const index = tests.findIndex(test => test(a) || test(b))
	const test = tests[index]
	if (!test(a)) return 1
	if (!test(b)) return -1

	// On numbers, sort small to large.
	if (index === 0) return numericNodeToNumber(a) - numericNodeToNumber(b)

	// On single-variable factors, sort by variable name.
	if (index === 2) {
		const aVariables = getVariables(a)
		const bVariables = getVariables(b)
		if (aVariables.length === 1 && bVariables.length === 1) return compareVariableNodes(aVariables[0], bVariables[0])
		return 0
	}

	// On sums, put longer before shorter.
	if (index === 3 && isSum(a) && isSum(b)) return a.terms.length - b.terms.length

	// No reason to shift factors.
	return 0
}
