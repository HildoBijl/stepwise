import { type ExpressionNode } from '../../../construction/index.ts'

import { isFloatNode, isIntegerNode, isSignNode, isPlusMinus, isVariable, isSum, isProduct, isFraction, isPower, isRootFunction, isLogarithmFunction, isAnyTrigonometricFunction } from './typeChecks.ts'

import { someNode } from './traversal.ts'
import { isInteger } from './valueChecks.ts'

// Check if an expression contains variables.
export function containsVariables(node: ExpressionNode): boolean {
	return someNode(node, isVariable)
}

// Check if an expression is numeric: no variables except known numeric constants.
export function isNumeric(node: ExpressionNode): boolean {
	return !containsVariables(node)
}

// Check if there any multi-character variables. (Needed for determining interpretation settings.)
export function containsMultiCharacterVariables(node: ExpressionNode): boolean {
	return someNode(node, node => isVariable(node) && node.symbol.length > 1)
}

// Check if an expression has any float.
export function containsFloat(node: ExpressionNode): boolean {
	return someNode(node, isFloatNode)
}

// Check if there are specific types of functions.
export function containsRoot(node: ExpressionNode): boolean {
	return someNode(node, node => isRootFunction(node))
}
export function containsLogarithm(node: ExpressionNode): boolean {
	return someNode(node, node => isLogarithmFunction(node))
}
export function containsTrigonometricFunction(node: ExpressionNode): boolean {
	return someNode(node, node => isAnyTrigonometricFunction(node))
}

// Check if an expression is plural-valued or single-valued.
export function isPlural(node: ExpressionNode): boolean {
	return someNode(node, isPlusMinus)
}
export function isSingular(node: ExpressionNode): boolean {
	return !isPlural(node)
}

// Structural polynomial check.
export function isPolynomial(node: ExpressionNode): boolean {
	if (isNumeric(node)) return true
	if (isSignNode(node)) return isPolynomial(node.node)
	if (isVariable(node)) return true
	if (isSum(node)) return node.terms.every(isPolynomial)
	if (isProduct(node)) return node.factors.every(isPolynomial)
	if (isFraction(node)) return isPolynomial(node.numerator) && isNumeric(node.denominator)
	if (isPower(node)) return isPolynomial(node.base) && isIntegerNode(node.exponent)
	return false
}

// Structural rational check.
export function isRational(node: ExpressionNode): boolean {
	if (isPolynomial(node)) return true
	if (isSignNode(node)) return isRational(node.node)
	if (isSum(node)) return node.terms.every(isRational)
	if (isProduct(node)) return node.factors.every(isRational)
	if (isFraction(node)) return isRational(node.numerator) && isRational(node.denominator)
	if (isPower(node)) return isRational(node.base) && isInteger(node.exponent)
	return false
}
