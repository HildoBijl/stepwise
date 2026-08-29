import {
	Expression, type ExpressionInputValue, ExpressionType, isExpressionInputValue, inputValueToExpression, expressionToInputValue,
	Equation, type EquationInputValue, EquationType, isEquationInputValue, inputValueToEquation, equationToInputValue,
} from '@step-wise/cas'

import type { InputValueAdapter } from '../types.ts'

export const expressionInputValueAdapter = {
	isInputValue: isExpressionInputValue,
	isDomainValue: (value: unknown): value is Expression => value instanceof Expression,
	interpret: inputValueToExpression,
	toInputValue: expressionToInputValue,
} satisfies InputValueAdapter<ExpressionInputValue, Expression>

export const equationInputValueAdapter = {
	isInputValue: isEquationInputValue,
	isDomainValue: (value: unknown): value is Equation => value instanceof Equation,
	interpret: inputValueToEquation,
	toInputValue: equationToInputValue,
} satisfies InputValueAdapter<EquationInputValue, Equation>

export const casInputValueAdapters = {
	[ExpressionType]: expressionInputValueAdapter,
	[EquationType]: equationInputValueAdapter,
}
