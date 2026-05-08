import { first, compareNumbers } from '@step-wise/utils'

import { ExpressionNode, Sign, ConstantNode, Integer, Float } from '../../../construction'

import { isSignNode, isIntegerNode, isFloatNode, isConstantNode, isSum, isProduct, isFraction } from '../fundamentals'

// Signs.
export function isNegativeSign(node: ExpressionNode): node is Sign { return isSignNode(node) && node.negative && !node.plusMinus }
export function isPlusMinusSign(node: ExpressionNode): node is Sign { return isSignNode(node) && node.plusMinus }

// Constants.
export function isZero(node: ExpressionNode): node is Integer { return isConstantNode(node) && node.value === 0 }
export function isOne(node: ExpressionNode): node is Integer { return isConstantNode(node) && node.value === 1 }
export function isTwo(node: ExpressionNode): node is Integer { return isConstantNode(node) && node.value === 2 }
export function isMinusOne(node: ExpressionNode): node is Sign { return isSignNode(node) && isOne(node.node) && node.negative && !node.plusMinus }

// Integer checks.
export function isNonNegativeInteger(node: ExpressionNode): node is Integer { return isIntegerNode(node) }
export function isPositiveInteger(node: ExpressionNode): node is Integer { return isIntegerNode(node) && node.value > 0 }
export function isNonPositiveInteger(node: ExpressionNode): boolean { return isZero(node) || (isNegativeSign(node) && isNonNegativeInteger(node.node)) }
export function isNegativeInteger(node: ExpressionNode): node is Sign { return isNegativeSign(node) && isPositiveInteger(node.node) }
export function isInteger(node: ExpressionNode): boolean { return isNonNegativeInteger(node) || isNonPositiveInteger(node) }

// Constant checks.
export function isNonNegativeConstant(node: ExpressionNode): node is ConstantNode { return isConstantNode(node) }
export function isPositiveConstant(node: ExpressionNode): node is ConstantNode { return isConstantNode(node) && node.value > 0 }
export function isNonPositiveConstant(node: ExpressionNode): node is ConstantNode { return isZero(node) || (isNegativeSign(node) && isNonNegativeConstant(node.node)) }
export function isNegativeConstant(node: ExpressionNode): node is ConstantNode { return isNegativeSign(node) && isPositiveConstant(node.node) }

// Float checks.
export function isZeroFloat(node: ExpressionNode): node is Float { return isFloatNode(node) && compareNumbers(node.value, 0) }
export function isPositiveFloat(node: ExpressionNode): node is Float { return isFloatNode(node) && node.value > 0 }
export function isNegativeFloat(node: ExpressionNode): node is Float { return isFloatNode(node) && node.value < 0 }

// Display/sign check.
export function isNegativeLiteral(node: ExpressionNode): boolean {
	if (isSignNode(node)) return node.negative && !node.plusMinus
	if (isSum(node)) return node.terms.every(term => isNegativeLiteral(term))
	if (isProduct(node)) return isNegativeLiteral(first(node.factors))
	if (isFraction(node)) return isNegativeLiteral(node.numerator)
	return false
}
