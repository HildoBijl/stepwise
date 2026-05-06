import type { InputValuePart, InterpretationSettings } from '@step-wise/math-input-value'

import type { ExpressionNode } from '../nodes'

export type IntermediateInterpretationPart = InputValuePart | ExpressionNode

type Interpreter = (value: IntermediateInterpretationPart[], settings: InterpretationSettings, context: InterpreterContext) => ExpressionNode
export type InterpreterContext = {
	interpretBrackets: (value: InputValuePart[], settings: InterpretationSettings, context: InterpreterContext) => ExpressionNode
	interpretSums: Interpreter
	interpretProducts: Interpreter
	interpretStringsAndElements: Interpreter
	interpretSpecialFunctionWithParameterAfter: (name: string, externalArgument: ExpressionNode, internalArguments: ExpressionNode[], settings: InterpretationSettings, context: InterpreterContext) => ExpressionNode
}
