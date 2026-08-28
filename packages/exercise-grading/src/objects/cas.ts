import { type ExpressionEqualityOptionsInput, Expression, ExpressionType } from '@step-wise/cas'
import { type EquationEqualityOptionsInput, Equation, EquationType } from '@step-wise/cas'

import type { TypeCompareFunction } from '../types.ts'

export function compareExpression(inputValue: unknown, expectedValue: unknown, options: ExpressionEqualityOptionsInput): boolean {
	if (!(expectedValue instanceof Expression) || !(inputValue instanceof Expression)) throw new Error(`Invalid Expression comparison: received parameters that were not Expressions.`)
	return expectedValue.equals(inputValue, options)
}

export function compareEquation(inputValue: unknown, expectedValue: unknown, options: EquationEqualityOptionsInput): boolean {
	if (!(expectedValue instanceof Equation) || !(inputValue instanceof Equation)) throw new Error(`Invalid Equation comparison: received parameters that were not Equations.`)
	return expectedValue.equals(inputValue, options)
}

export const casCompareFunctions = {
	[ExpressionType]: compareExpression,
	[EquationType]: compareEquation,
} satisfies Record<string, TypeCompareFunction>
