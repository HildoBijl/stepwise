import { ExpressionNode } from '../../../construction'

import { someDescendant } from '../traversal'

import { isFloat, isInteger, isPlusMinus, isVariable, isSum, isProduct, isFraction, isPower } from './typeChecks'
import { hasVariables } from './dependencyChecks'

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
	if (isPower(node)) return isPolynomial(node.base) && isInteger(node.exponent) && node.exponent.value >= 0
	return false
}

// Structural rational check.
export function isRational(node: ExpressionNode): boolean {
	if (isPolynomial(node)) return true
	if (isFraction(node)) return isRational(node.numerator) && isRational(node.denominator)
	if (isSum(node)) return node.terms.every(isRational)
	if (isProduct(node)) return node.factors.every(isRational)
	if (isPower(node)) return isRational(node.base) && isInteger(node.exponent)
	return false
}
