import {
	type Expression, type ExpressionInputValue, ExpressionType, inputValueToExpression, expressionToInputValue,
	type Equation, type EquationInputValue, EquationType, inputValueToEquation, equationToInputValue,
} from '@step-wise/cas'

import type { InputValueAdapter } from '../types.ts'

export const expressionInputValueAdapter = {
	interpret: inputValueToExpression,
	toInputValue: expressionToInputValue,
} satisfies InputValueAdapter<ExpressionInputValue, Expression>

export const equationInputValueAdapter = {
	interpret: inputValueToEquation,
	toInputValue: equationToInputValue,
} satisfies InputValueAdapter<EquationInputValue, Equation>

export const casInputValueAdapters = {
	[ExpressionType]: expressionInputValueAdapter,
	[EquationType]: equationInputValueAdapter,
}
