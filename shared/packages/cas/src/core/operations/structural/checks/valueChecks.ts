import { first, compareNumbers } from '@step-wise/utils'

import { ExpressionNode, ConstantNode, Integer, Float } from '../../../construction'

import { isInteger, isFloat, isConstantNode, isSum, isProduct, isFraction } from './typeChecks'

// Constants.
export function isZero(node: ExpressionNode): node is Integer { return isInteger(node) && node.value === 0 }
export function isOne(node: ExpressionNode): node is Integer { return isInteger(node) && node.value === 1 }
export function isMinusOne(node: ExpressionNode): node is Integer { return isInteger(node) && node.value === -1 }
export function isTwo(node: ExpressionNode): node is Integer { return isInteger(node) && node.value === 2 }

// Integer checks.
export function isPositiveInteger(node: ExpressionNode): node is Integer { return isInteger(node) && node.value > 0 }
export function isNegativeInteger(node: ExpressionNode): node is Integer { return isInteger(node) && node.value < 0 }
export function isNonNegativeInteger(node: ExpressionNode): node is Integer { return isInteger(node) && node.value >= 0 }
export function isNonPositiveInteger(node: ExpressionNode): node is Integer { return isInteger(node) && node.value <= 0 }

// Constant checks.
export function isPositiveConstant(node: ExpressionNode): node is ConstantNode { return isConstantNode(node) && node.value > 0 }
export function isNegativeConstant(node: ExpressionNode): node is ConstantNode { return isConstantNode(node) && node.value < 0 }
export function isNonNegativeConstant(node: ExpressionNode): node is ConstantNode { return isConstantNode(node) && node.value >= 0 }
export function isNonPositiveConstant(node: ExpressionNode): node is ConstantNode { return isConstantNode(node) && node.value <= 0 }

// Float checks.
export function isZeroFloat(node: ExpressionNode): node is Float { return isFloat(node) && compareNumbers(node.value, 0) }
export function isPositiveFloat(node: ExpressionNode): node is Float { return isFloat(node) && node.value > 0 }
export function isNegativeFloat(node: ExpressionNode): node is Float { return isFloat(node) && node.value < 0 }

// Display/sign check.
export function isNegativeLiteral(node: ExpressionNode): boolean {
	if (isConstantNode(node)) return isNegativeConstant(node)
	if (isSum(node)) return node.terms.every(term => isNegativeLiteral(term))
	if (isProduct(node)) return isNegativeLiteral(first(node.factors))
	if (isFraction(node)) return isNegativeLiteral(node.numerator)
	return false
}
