import { type ExpressionNode, type Variable, Sum } from '../../../../construction'

import { isVariable, isProduct, isPower, isNumeric, isPolynomial, isRational, numericNodeToNumber, getVariables, equalVariables, dependsOn } from '../../../structural'

import { compareVariableNodes } from '../utils'

export function sortSums(node: Sum): Sum {
	const terms = [...node.terms].sort(orderSumTerms)
	return terms.every((term, index) => term === node.terms[index]) ? node : new Sum(terms)
}

// Sorting function that determines which of two expressions should come first.
function orderSumTerms(a: ExpressionNode, b: ExpressionNode): number {
	// First sort by type.
	const tests = [(node: ExpressionNode) => isPolynomial(node) && !isNumeric(node), isNumeric, isRational, () => true]
	const index = tests.findIndex(test => test(a) || test(b))
	const test = tests[index]
	if (!test(a)) return 1
	if (!test(b)) return -1

	// On numbers, sort large to small. Otherwise check variable lists.
	if (index === 1) return numericNodeToNumber(b) - numericNodeToNumber(a)
	return compareVariableLists(a, b)
}

// Sorting function that determines, based on the variables that occur in an expression, which expression should come first in a term sorting.
function compareVariableLists(a: ExpressionNode, b: ExpressionNode): number {
	const aVariables = getVariables(a)
	const bVariables = getVariables(b)
	for (let i = 0; i < aVariables.length; i++) {
		const aVariable = aVariables[i]
		const bVariable = bVariables[i]
		if (!bVariable) return -1
		const variableOrder = compareVariableNodes(aVariable, bVariable)
		if (variableOrder !== 0) return variableOrder
		const powerOrder = compareVariablePower(a, b, aVariable)
		if (powerOrder !== 0) return powerOrder
	}
	return bVariables.length > aVariables.length ? 1 : 0
}

// Given two powers of equal variables, determine which power should appear earlier in a sum.
function compareVariablePower(a: ExpressionNode, b: ExpressionNode, variable: Variable): number {
	const aPower = getExponentOfVariable(variable, a)
	const bPower = getExponentOfVariable(variable, b)
	if (aPower === undefined && bPower === undefined) return 0
	return (bPower ?? -Infinity) - (aPower ?? -Infinity)
}

// For an expression depending on a variable, try to find the exponent that's above this variable.
function getExponentOfVariable(variable: Variable, expression: ExpressionNode): number | undefined {
	if (isVariable(expression) && equalVariables(expression, variable)) return 1
	if (isPower(expression) && isVariable(expression.base) && equalVariables(expression.base, variable) && isNumeric(expression.exponent)) return numericNodeToNumber(expression.exponent)
	if (isProduct(expression)) {
		const factor = expression.factors.find(factor => dependsOn(factor, variable))
		return factor ? getExponentOfVariable(variable, factor) : undefined
	}
	return undefined
}
