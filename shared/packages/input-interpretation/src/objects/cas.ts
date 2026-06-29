import {
	type Expression as ExpressionType, type ExpressionInputValue, interpretExpressionInputValue, expressionToInputValue,
	type Equation as EquationType, type EquationInputValue, interpretEquationInputValue, equationToInputValue,
} from '@step-wise/cas'

import type { InterpreterEntry } from '../types'

export { ExpressionInputValue, EquationInputValue } from '@step-wise/cas'

export const Expression = {
	interpret: interpretExpressionInputValue,
	toInputValue: expressionToInputValue,
} satisfies InterpreterEntry<ExpressionInputValue, ExpressionType>

export const Equation = {
	interpret: interpretEquationInputValue,
	toInputValue: equationToInputValue,
} satisfies InterpreterEntry<EquationInputValue, EquationType>
