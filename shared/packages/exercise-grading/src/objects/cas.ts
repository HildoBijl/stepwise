import { type ExpressionEqualityOptionsInput, Expression, ExpressionType } from '@step-wise/cas'
import { type EquationEqualityOptionsInput, Equation, EquationType } from '@step-wise/cas'

import type { TypeCompareFunction } from '../types'

export function compareExpression(input: unknown, correct: unknown, options: ExpressionEqualityOptionsInput): boolean {
	if (!(correct instanceof Expression) || !(input instanceof Expression)) throw new Error(`Invalid Expression comparison: received parameters that were not Expressions.`)
	return correct.equals(input, options)
}

export function compareEquation(input: unknown, correct: unknown, options: EquationEqualityOptionsInput): boolean {
	if (!(correct instanceof Equation) || !(input instanceof Equation)) throw new Error(`Invalid Equation comparison: received parameters that were not Equations.`)
	return correct.equals(input, options)
}

export const casCompareFunctions = {
	[ExpressionType]: compareExpression,
	[EquationType]: compareEquation,
} satisfies Record<string, TypeCompareFunction>
