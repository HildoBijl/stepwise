import { type ExpressionInputValue, type InterpretationSettings } from '@step-wise/math-input-value'

import { ExpressionNode } from '../nodes'

import type { InterpreterContext } from './types'
import { interpretBrackets, interpretProducts, interpretSpecialFunctionWithParameterAfter, interpretStringsAndElements, interpretSums } from './steps'

// Turn an InputValue to an ExpressionNode.
export function inputValueToExpressionNode(input: ExpressionInputValue, settings: InterpretationSettings): ExpressionNode {
	const context: InterpreterContext = { interpretBrackets, interpretSums, interpretProducts, interpretStringsAndElements, interpretSpecialFunctionWithParameterAfter } satisfies InterpreterContext
	return interpretBrackets(input.value, settings, context)
}
