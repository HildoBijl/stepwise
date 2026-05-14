import { type ExpressionNode, type Sin, type Cos, type Tan, type Arcsin, type Arccos, type Arctan, Integer, namedConstants, negative, sum, product, fraction, power, sqrt, sin, cos } from '../../../../construction'

import { type DerivativeContext } from '../types'

export function getSinDerivative(node: Sin, context: DerivativeContext): ExpressionNode {
	return product(cos(node.argument), context.getDerivative(node.argument), getTrigonometryDerivativeFactor(context))
}

export function getCosDerivative(node: Cos, context: DerivativeContext): ExpressionNode {
	return negative(product(sin(node.argument), context.getDerivative(node.argument), getTrigonometryDerivativeFactor(context)))
}

export function getTanDerivative(node: Tan, context: DerivativeContext): ExpressionNode {
	return product(fraction(context.getDerivative(node.argument), power(cos(node.argument), 2)), getTrigonometryDerivativeFactor(context))
}

export function getArcsinDerivative(node: Arcsin, context: DerivativeContext): ExpressionNode {
	return product(fraction(context.getDerivative(node.argument), sqrt(sum(1, negative(power(node.argument, 2))))), getInverseTrigonometryDerivativeFactor(context))
}

export function getArccosDerivative(node: Arccos, context: DerivativeContext): ExpressionNode {
	return negative(product(fraction(context.getDerivative(node.argument), sqrt(sum(1, negative(power(node.argument, 2))))), getInverseTrigonometryDerivativeFactor(context)))
}

export function getArctanDerivative(node: Arctan, context: DerivativeContext): ExpressionNode {
	return product(fraction(context.getDerivative(node.argument), sum(1, power(node.argument, 2))), getInverseTrigonometryDerivativeFactor(context))
}

function getTrigonometryDerivativeFactor(context: DerivativeContext): ExpressionNode {
	return context.expressionSettings.degrees ? fraction(namedConstants.pi, 180) : Integer.one
}

function getInverseTrigonometryDerivativeFactor(context: DerivativeContext): ExpressionNode {
	return context.expressionSettings.degrees ? fraction(180, namedConstants.pi) : Integer.one
}
