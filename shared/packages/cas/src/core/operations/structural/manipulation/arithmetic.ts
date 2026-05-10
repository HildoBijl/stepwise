import { type ExpressionNodeInput, negative, sum, product, fraction } from '../../../construction'

export const add = (...terms: ExpressionNodeInput[]) => sum(...terms)
export const subtract = (minuend: ExpressionNodeInput, subtrahend: ExpressionNodeInput) => sum(minuend, negative(subtrahend))
export const multiply = (...factors: ExpressionNodeInput[]) => product(...factors)
export const divide = (numerator: ExpressionNodeInput, denominator: ExpressionNodeInput) => fraction(numerator, denominator)
