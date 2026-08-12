import { Fraction, Power, Root, Ln, Sqrt, Log, Sin, Cos, Tan, Arcsin, Arccos, Arctan } from '../nodes'

import { type ExpressionNodeInput, asExpressionNode } from './asExpressionNode'

// Fundamental functions.
export const fraction = (numerator: ExpressionNodeInput, denominator: ExpressionNodeInput) => new Fraction(asExpressionNode(numerator), asExpressionNode(denominator))
export const power = (base: ExpressionNodeInput, exponent: ExpressionNodeInput) => new Power(asExpressionNode(base), asExpressionNode(exponent))
export const sqrt = (radicand: ExpressionNodeInput) => new Sqrt(asExpressionNode(radicand))
export const root = (radicand: ExpressionNodeInput, degree: ExpressionNodeInput) => new Root(asExpressionNode(radicand), asExpressionNode(degree))
export const ln = (argument: ExpressionNodeInput) => new Ln(asExpressionNode(argument))
export const log = (argument: ExpressionNodeInput, base: ExpressionNodeInput) => new Log(asExpressionNode(argument), asExpressionNode(base))

// Trigonometry.
export const sin = (argument: ExpressionNodeInput) => new Sin(asExpressionNode(argument))
export const cos = (argument: ExpressionNodeInput) => new Cos(asExpressionNode(argument))
export const tan = (argument: ExpressionNodeInput) => new Tan(asExpressionNode(argument))
export const arcsin = (argument: ExpressionNodeInput) => new Arcsin(asExpressionNode(argument))
export const arccos = (argument: ExpressionNodeInput) => new Arccos(asExpressionNode(argument))
export const arctan = (argument: ExpressionNodeInput) => new Arctan(asExpressionNode(argument))
