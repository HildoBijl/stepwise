import { ExpressionNode, SignNode, ConstantNode, Integer, Float } from '../../../construction'

import { isIntegerNode, isFloatNode, isConstantNode, isMinus } from './typeChecks'

type ConstantWithValue<Value extends number> = ConstantNode & { readonly value: Value }
type SignWithNode<Node extends ExpressionNode> = SignNode & { readonly node: Node }

// Specific values
export function isZero(node: ExpressionNode): node is ConstantWithValue<0> { return isConstantNode(node) && node.value === 0 }
export function isOne(node: ExpressionNode): node is ConstantWithValue<1> { return isConstantNode(node) && node.value === 1 }
export function isTwo(node: ExpressionNode): node is ConstantWithValue<2> { return isConstantNode(node) && node.value === 2 }
export function isMinusOne(node: ExpressionNode): node is SignWithNode<ConstantWithValue<1>> { return isMinus(node) && isOne(node.node) }

// Constants
export function isConstant(node: ExpressionNode): boolean { return isConstantNode(node) || (isMinus(node) && isConstantNode(node.node)) }
export function isNonNegativeConstant(node: ExpressionNode): node is ConstantNode { return isConstantNode(node) }
export function isPositiveConstant(node: ExpressionNode): boolean { return isConstantNode(node) && hasPositiveValue(node) }
export function isNonPositiveConstant(node: ExpressionNode): boolean { return isZero(node) || (isMinus(node) && isNonNegativeConstant(node.node)) }
export function isNegativeConstant(node: ExpressionNode): boolean { return isMinus(node) && isConstantNode(node.node) && hasPositiveValue(node.node) }

// Integers
export function isInteger(node: ExpressionNode): node is Integer | SignWithNode<Integer> { return isIntegerNode(node) || (isMinus(node) && isIntegerNode(node.node)) }
export function isNonNegativeInteger(node: ExpressionNode): node is Integer { return isIntegerNode(node) }
export function isPositiveInteger(node: ExpressionNode): boolean { return isIntegerNode(node) && hasPositiveValue(node) }
export function isNonPositiveInteger(node: ExpressionNode): boolean { return (isIntegerNode(node) && node.value === 0) || (isMinus(node) && isNonNegativeInteger(node.node)) }
export function isNegativeInteger(node: ExpressionNode): boolean { return isMinus(node) && isIntegerNode(node.node) && hasPositiveValue(node.node) }

// Floats
export function isFloat(node: ExpressionNode): node is Float | SignWithNode<Float> { return isFloatNode(node) || (isMinus(node) && isFloatNode(node.node)) }
export function isNonNegativeFloat(node: ExpressionNode): node is Float { return isFloatNode(node) }
export function isPositiveFloat(node: ExpressionNode): boolean { return isFloatNode(node) && hasPositiveValue(node) }
export function isNonPositiveFloat(node: ExpressionNode): boolean { return (isFloatNode(node) && node.value === 0) || (isMinus(node) && isNonNegativeFloat(node.node)) }
export function isNegativeFloat(node: ExpressionNode): boolean { return isMinus(node) && isFloatNode(node.node) && hasPositiveValue(node.node) }

function hasPositiveValue(node: ConstantNode): boolean {
	return node.value > 0
}
