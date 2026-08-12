import { type ExpressionNode } from '../../../construction'

import { isFloatNode, isIntegerNode, isSignNode, isPlusMinus, isVariable, isSum, isProduct, isFraction, isPower, isRootLike, isLogLike, isTrigonometryLike } from '../fundamentals'

import { someDescendant } from './traversal'
import { isInteger } from './valueChecks'

// Check if an expression contains variables.
export function hasVariables(node: ExpressionNode): boolean {
	return someDescendant(node, isVariable, true)
}

// Check if an expression is numeric: no variables except known numeric constants.
export function isNumeric(node: ExpressionNode): boolean {
	return !hasVariables(node)
}

// Check if there any multi-character variables. (Needed for determining interpretation settings.)
export function hasMultiCharacterVariables(node: ExpressionNode): boolean {
	return someDescendant(node, node => isVariable(node) && node.symbol.length > 1, true)
}

// Check if an expression has any float.
export function hasFloat(node: ExpressionNode): boolean {
	return someDescendant(node, isFloatNode, true)
}

// Check if there are specific types of functions.
export function hasRoot(node: ExpressionNode): boolean {
	return someDescendant(node, node => isRootLike(node), true)
}
export function hasLog(node: ExpressionNode): boolean {
	return someDescendant(node, node => isLogLike(node), true)
}
export function hasTrigonometry(node: ExpressionNode): boolean {
	return someDescendant(node, node => isTrigonometryLike(node), true)
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
