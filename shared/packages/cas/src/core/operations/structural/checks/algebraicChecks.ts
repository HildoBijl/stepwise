import { ExpressionNode, Variable, numericVariables } from '../../../construction'

import { someDescendant, isFloat, isInteger, isPlusMinus, isVariableNode, isSum, isProduct, isFraction, isPower, equalVariables } from '../fundamentals'

// Typing to distinguish numeric and non-numeric variables.
export function isNumericVariable(node: ExpressionNode): node is Variable { return isVariableNode(node) && numericVariables.some(variable => equalVariables(node, variable)) }
export function isVariable(node: ExpressionNode): node is Variable { return isVariableNode(node) && !isNumericVariable(node) }

// Check if an expression contains variables.
export function hasVariables(node: ExpressionNode): boolean {
	return someDescendant(node, isVariable, true)
}

// Check if an expression is numeric: no variables except known numeric constants.
export function isNumeric(node: ExpressionNode): boolean {
	return !hasVariables(node)
}

// Check if an expression has any float.
export function hasFloat(node: ExpressionNode): boolean {
	return someDescendant(node, isFloat, true)
}

// Check if an expression is plural-valued or single-valued.
export function isPlural(node: ExpressionNode): boolean {
	return someDescendant(node, descendant => isPlusMinus(descendant), true)
}
export function isSingular(node: ExpressionNode): boolean {
	return !isPlural(node)
}

// Structural polynomial check.
export function isPolynomial(node: ExpressionNode): boolean {
	if (isNumeric(node)) return true
	if (isVariable(node)) return true
	if (isSum(node)) return node.terms.every(isPolynomial)
	if (isProduct(node)) return node.factors.every(isPolynomial)
	if (isFraction(node)) return isPolynomial(node.numerator) && isNumeric(node.denominator)
	if (isPower(node)) return isPolynomial(node.base) && isInteger(node.exponent) && node.exponent.value >= 0
	return false
}

// Structural rational check.
export function isRational(node: ExpressionNode): boolean {
	if (isPolynomial(node)) return true
	if (isSum(node)) return node.terms.every(isRational)
	if (isProduct(node)) return node.factors.every(isRational)
	if (isFraction(node)) return isRational(node.numerator) && isRational(node.denominator)
	if (isPower(node)) return isRational(node.base) && isInteger(node.exponent)
	return false
}
