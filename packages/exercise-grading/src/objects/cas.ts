import { type ExpressionEqualityOptionsInput, Expression, ExpressionType } from '@step-wise/cas'
import { type EquationEqualityOptionsInput, Equation, EquationType } from '@step-wise/cas'
import type { ValueEqualityAdapter } from '@step-wise/value-equality'

import { isValueEqualityOptions } from './support.ts'

export function areExpressionsEqual(inputValue: Expression, expectedValue: Expression, options?: ExpressionEqualityOptionsInput): boolean {
	return expectedValue.equals(inputValue, options)
}

export function areEquationsEqual(inputValue: Equation, expectedValue: Equation, options: EquationEqualityOptionsInput = {}): boolean {
	return expectedValue.equals(inputValue, options)
}

export const casEqualityAdapters = {
	[ExpressionType]: {
		isValue: (value): value is Expression => value instanceof Expression,
		isOptions: isValueEqualityOptions,
		areEqual: areExpressionsEqual,
	} satisfies ValueEqualityAdapter<Expression, ExpressionEqualityOptionsInput>,
	[EquationType]: {
		isValue: (value): value is Equation => value instanceof Equation,
		isOptions: isValueEqualityOptions,
		areEqual: areEquationsEqual,
	} satisfies ValueEqualityAdapter<Equation, EquationEqualityOptionsInput>,
}
