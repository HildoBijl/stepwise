import {
	type Expression, type ExpressionInputValue, ExpressionType, interpretExpressionInputValue, expressionToInputValue,
	type Equation, type EquationInputValue, EquationType, interpretEquationInputValue, equationToInputValue,
} from '@step-wise/cas'

import type { InputValueAdapter } from '../types'

export const expressionInputValueAdapter = {
	interpret: interpretExpressionInputValue,
	toInputValue: expressionToInputValue,
} satisfies InputValueAdapter<ExpressionInputValue, Expression>

export const equationInputValueAdapter = {
	interpret: interpretEquationInputValue,
	toInputValue: equationToInputValue,
} satisfies InputValueAdapter<EquationInputValue, Equation>

export const casInputValueAdapters = {
	[ExpressionType]: expressionInputValueAdapter,
	[EquationType]: equationInputValueAdapter,
}
