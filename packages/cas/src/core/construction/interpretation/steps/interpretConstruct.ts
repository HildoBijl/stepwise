import { type FractionInputValue, type LogarithmInputValue, type RootInputValue, type SquareRootInputValue, isEmptyExpressionValue } from '@step-wise/math-input-value'

import { type ExpressionNode, Fraction, Integer, Log, Root, Sqrt } from '../../nodes/index.ts'

import type { InterpreterContext } from '../types.ts'

// Interpret constructs whose arguments are stored entirely within the construct.
export function interpretFraction(element: FractionInputValue, context: InterpreterContext): ExpressionNode {
	return new Fraction(context.interpretBrackets(element.numerator, context), context.interpretBrackets(element.denominator, context))
}

export function interpretSquareRoot(element: SquareRootInputValue, context: InterpreterContext): ExpressionNode {
	return new Sqrt(context.interpretBrackets(element.radicand, context))
}

export function interpretRoot(element: RootInputValue, context: InterpreterContext): ExpressionNode {
	const radicand = context.interpretBrackets(element.radicand, context)
	const degree = isEmptyExpressionValue(element.degree) ? Integer.two : context.interpretBrackets(element.degree, context)
	return new Root(radicand, degree)
}

// A logarithm's argument follows the construct as an external bracket group; only its base is stored within the construct.
export function interpretLogarithm(element: LogarithmInputValue, argument: ExpressionNode, context: InterpreterContext): ExpressionNode {
	const base = isEmptyExpressionValue(element.base) ? Integer.ten : context.interpretBrackets(element.base, context)
	return new Log(argument, base)
}
