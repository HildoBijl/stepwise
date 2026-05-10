import { first } from '@step-wise/utils'

import { ExpressionNode, Sign, ConstantNode, Integer, Float } from '../../../construction'

import { isSignNode, isIntegerNode, isFloatNode, isConstantNode, isSum, isProduct, isFraction } from '../fundamentals'

// Signs
export function isNegativeSign(node: ExpressionNode): node is Sign { return isSignNode(node) && node.negative && !node.plusMinus }
export function isPlusMinusSign(node: ExpressionNode): node is Sign { return isSignNode(node) && node.plusMinus }
export function isNegativeLiteral(node: ExpressionNode): boolean {
	if (isSignNode(node)) return node.negative && !node.plusMinus
	if (isSum(node)) return node.terms.every(term => isNegativeLiteral(term))
	if (isProduct(node)) return isNegativeLiteral(first(node.factors))
	if (isFraction(node)) return isNegativeLiteral(node.numerator)
	return false
}

// Specific values
export function isZero(node: ExpressionNode): node is ConstantNode { return isConstantNode(node) && node.value === 0 }
export function isOne(node: ExpressionNode): node is ConstantNode { return isConstantNode(node) && node.value === 1 }
export function isTwo(node: ExpressionNode): node is ConstantNode { return isConstantNode(node) && node.value === 2 }
export function isMinusOne(node: ExpressionNode): node is Sign { return isNegativeSign(node) && isOne(node.node) }

// Constants
export function isConstant(node: ExpressionNode): boolean { return isConstantNode(node) || (isNegativeSign(node) && isConstantNode(node.node)) }
export function isNonNegativeConstant(node: ExpressionNode): node is ConstantNode { return isConstantNode(node) }
export function isPositiveConstant(node: ExpressionNode): node is ConstantNode { return isConstantNode(node) && node.value > 0 }
export function isNonPositiveConstant(node: ExpressionNode): node is ConstantNode | Sign { return (isConstantNode(node) && isZero(node)) || (isNegativeSign(node) && isNonNegativeConstant(node.node)) }
export function isNegativeConstant(node: ExpressionNode): node is ConstantNode | Sign { return isNegativeSign(node) && isPositiveConstant(node.node) }

// Integers
export function isInteger(node: ExpressionNode): node is Integer | Sign { return isIntegerNode(node) || (isNegativeSign(node) && isIntegerNode(node.node)) }
export function isNonNegativeInteger(node: ExpressionNode): node is Integer { return isIntegerNode(node) }
export function isPositiveInteger(node: ExpressionNode): node is Integer { return isIntegerNode(node) && node.value > 0 }
export function isNonPositiveInteger(node: ExpressionNode): node is Integer | Sign { return (isIntegerNode(node) && isZero(node)) || (isNegativeSign(node) && isNonNegativeInteger(node.node)) }
export function isNegativeInteger(node: ExpressionNode): node is Sign { return isNegativeSign(node) && isPositiveInteger(node.node) }

// Floats
export function isFloat(node: ExpressionNode): node is Float | Sign { return isFloatNode(node) || (isNegativeSign(node) && isFloatNode(node.node)) }
export function isNonNegativeFloat(node: ExpressionNode): node is Float { return isFloatNode(node) }
export function isPositiveFloat(node: ExpressionNode): node is Float { return isFloatNode(node) && node.value > 0 }
export function isNonPositiveFloat(node: ExpressionNode): node is Float | Sign { return (isFloatNode(node) && isZero(node)) || (isNegativeSign(node) && isNonNegativeFloat(node.node)) }
export function isNegativeFloat(node: ExpressionNode): node is Sign { return isNegativeSign(node) && isPositiveFloat(node.node) }
