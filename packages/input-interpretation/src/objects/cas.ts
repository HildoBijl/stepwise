import {
	type Expression, type ExpressionInputValue, ExpressionType, interpretExpressionInputValue, expressionToInputValue,
	type Equation, type EquationInputValue, EquationType, interpretEquationInputValue, equationToInputValue,
} from '@step-wise/cas'

import type { InterpreterEntry } from '../types'

export { type ExpressionInputValue, type EquationInputValue, ExpressionType, EquationType }

export const ExpressionInterpreter = {
	interpret: interpretExpressionInputValue,
	toInputValue: expressionToInputValue,
} satisfies InterpreterEntry<ExpressionInputValue, Expression>

export const EquationInterpreter = {
	interpret: interpretEquationInputValue,
	toInputValue: equationToInputValue,
} satisfies InterpreterEntry<EquationInputValue, Equation>

export const casInterpreters = {
	[ExpressionType]: ExpressionInterpreter,
	[EquationType]: EquationInterpreter,
}
