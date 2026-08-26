import { type ExpressionNode, type Product, product } from '../../../../construction'

import { isProduct, isInteger, isFloat, isVariable, isPower, isSum, isNumeric, isSingular, someDescendant, tryNumericNodeToNumber, getVariables } from '../../../structural'

import { defineRule } from '../ruleDefinition'
import { compareVariableNodes } from '../utils'

function transform(node: Product): ExpressionNode {
	const factors = [...node.factors].sort(orderProductFactors)
	return factors.every((factor, index) => factor === node.factors[index]) ? node : product(...factors)
}

// Sorting function that determines which of two expressions should come first.
function orderProductFactors(a: ExpressionNode, b: ExpressionNode): number {
	// First sort by type.
	const tests = [(node: ExpressionNode) => isInteger(node) || isFloat(node), isNumeric, (node: ExpressionNode) => isVariable(node) || isPower(node), isSum, () => true]
	const index = tests.findIndex(test => test(a) || test(b))
	const test = tests[index]
	if (!test(a)) return 1
	if (!test(b)) return -1

	// On numbers, sort small to large.
	if ((index === 0 || index === 1) && isSingular(a) && isSingular(b)) {
		const aValue = tryNumericNodeToNumber(a)
		const bValue = tryNumericNodeToNumber(b)
		return aValue === undefined || bValue === undefined ? 0 : aValue - bValue
	}

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

export const sortProducts = defineRule({
	name: 'sortProducts',
	appliesTo: isProduct,
	transform,
})
