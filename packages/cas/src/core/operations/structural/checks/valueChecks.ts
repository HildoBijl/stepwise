import { ExpressionNode, SignNode, ConstantNode, Integer, Float } from '../../../construction'

import { isIntegerNode, isFloatNode, isConstantNode, isMinus } from '../fundamentals'

// Specific values
export function isZero(node: ExpressionNode): node is ConstantNode { return isConstantNode(node) && node.value === 0 }
export function isOne(node: ExpressionNode): node is ConstantNode { return isConstantNode(node) && node.value === 1 }
export function isTwo(node: ExpressionNode): node is ConstantNode { return isConstantNode(node) && node.value === 2 }
export function isMinusOne(node: ExpressionNode): node is SignNode { return isMinus(node) && isOne(node.node) }

// Constants
export function isConstant(node: ExpressionNode): boolean { return isConstantNode(node) || (isMinus(node) && isConstantNode(node.node)) }
export function isNonNegativeConstant(node: ExpressionNode): node is ConstantNode { return isConstantNode(node) }
export function isPositiveConstant(node: ExpressionNode): node is ConstantNode { return isConstantNode(node) && node.value > 0 }
export function isNonPositiveConstant(node: ExpressionNode): node is ConstantNode | SignNode { return isZero(node) || (isMinus(node) && isNonNegativeConstant(node.node)) }
export function isNegativeConstant(node: ExpressionNode): node is ConstantNode | SignNode { return isMinus(node) && isPositiveConstant(node.node) }

// Integers
export function isInteger(node: ExpressionNode): node is Integer | SignNode { return isIntegerNode(node) || (isMinus(node) && isIntegerNode(node.node)) }
export function isNonNegativeInteger(node: ExpressionNode): node is Integer { return isIntegerNode(node) }
export function isPositiveInteger(node: ExpressionNode): node is Integer { return isIntegerNode(node) && node.value > 0 }
export function isNonPositiveInteger(node: ExpressionNode): node is Integer | SignNode { return (isIntegerNode(node) && isZero(node)) || (isMinus(node) && isNonNegativeInteger(node.node)) }
export function isNegativeInteger(node: ExpressionNode): node is SignNode { return isMinus(node) && isPositiveInteger(node.node) }

// Floats
export function isFloat(node: ExpressionNode): node is Float | SignNode { return isFloatNode(node) || (isMinus(node) && isFloatNode(node.node)) }
export function isNonNegativeFloat(node: ExpressionNode): node is Float { return isFloatNode(node) }
export function isPositiveFloat(node: ExpressionNode): node is Float { return isFloatNode(node) && node.value > 0 }
export function isNonPositiveFloat(node: ExpressionNode): node is Float | SignNode { return (isFloatNode(node) && isZero(node)) || (isMinus(node) && isNonNegativeFloat(node.node)) }
export function isNegativeFloat(node: ExpressionNode): node is SignNode { return isMinus(node) && isPositiveFloat(node.node) }
