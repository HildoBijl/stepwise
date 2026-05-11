import { type ExpressionNodeInput, Integer, negative, sum, product, fraction } from '../../../construction'

export const add = (...terms: ExpressionNodeInput[]) => sum(...terms)
export const subtract = (minuend: ExpressionNodeInput = Integer.zero, subtrahend: ExpressionNodeInput = Integer.zero) => sum(minuend, negative(subtrahend))
export const multiply = (...factors: ExpressionNodeInput[]) => product(...factors)
export const divide = (numerator: ExpressionNodeInput, denominator: ExpressionNodeInput) => fraction(numerator, denominator)
