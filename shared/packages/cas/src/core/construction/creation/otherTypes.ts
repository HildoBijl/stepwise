import { removeUndefined } from '@step-wise/utils'

import { Sign, Integer, Sum, Product, Fraction, Power, Root, Ln, Sqrt, Log, Sin, Cos, Tan, Arcsin, Arccos, Arctan } from '../nodes'

import { type ExpressionNodeInput, asExpressionNode } from './asExpressionNode'

// Constants.
export const negative = (value: ExpressionNodeInput) => new Sign(asExpressionNode(value), true)
export const plusMinus = (value: ExpressionNodeInput) => new Sign(asExpressionNode(value), false, true)
export const minusPlus = (value: ExpressionNodeInput) => new Sign(asExpressionNode(value), true, true)

// Expression lists. Undefineds are removed from the list.
export const sum = (...terms: (ExpressionNodeInput | undefined)[]) => {
	const processedTerms = removeUndefined(terms)
	return processedTerms.length === 0 ? Integer.zero : processedTerms.length === 1 ? asExpressionNode(processedTerms[0]) : new Sum(processedTerms.map(asExpressionNode))
}
export const product = (...factors: (ExpressionNodeInput | undefined)[]) => {
	const processedFactors = removeUndefined(factors)
	return processedFactors.length === 0 ? Integer.one : processedFactors.length === 1 ? asExpressionNode(processedFactors[0]) : new Product(processedFactors.map(asExpressionNode))
}

// Functions.
export const fraction = (numerator: ExpressionNodeInput, denominator: ExpressionNodeInput) => new Fraction(asExpressionNode(numerator), asExpressionNode(denominator))
export const power = (base: ExpressionNodeInput, exponent: ExpressionNodeInput) => new Power(asExpressionNode(base), asExpressionNode(exponent))
export const sqrt = (argument: ExpressionNodeInput) => new Sqrt(asExpressionNode(argument))
export const root = (argument: ExpressionNodeInput, base: ExpressionNodeInput) => new Root(asExpressionNode(argument), asExpressionNode(base))
export const ln = (argument: ExpressionNodeInput) => new Ln(asExpressionNode(argument))
export const log = (argument: ExpressionNodeInput, base: ExpressionNodeInput) => new Log(asExpressionNode(argument), asExpressionNode(base))

// Trigonometry.
export const sin = (argument: ExpressionNodeInput) => new Sin(asExpressionNode(argument))
export const cos = (argument: ExpressionNodeInput) => new Cos(asExpressionNode(argument))
export const tan = (argument: ExpressionNodeInput) => new Tan(asExpressionNode(argument))
export const arcsin = (argument: ExpressionNodeInput) => new Arcsin(asExpressionNode(argument))
export const arccos = (argument: ExpressionNodeInput) => new Arccos(asExpressionNode(argument))
export const arctan = (argument: ExpressionNodeInput) => new Arctan(asExpressionNode(argument))
