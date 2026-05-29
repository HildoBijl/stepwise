import type { InputValuePart, InterpretationSettings } from '@step-wise/math-input-value'

import type { ExpressionNode } from '../nodes'

export type IntermediateInterpretationPart = InputValuePart | ExpressionNode

type Interpreter = (value: IntermediateInterpretationPart[], context: InterpreterContext) => ExpressionNode
export type InterpreterContext = {
	interpretationSettings: InterpretationSettings
	interpretBrackets: (value: InputValuePart[], context: InterpreterContext) => ExpressionNode
	interpretSums: Interpreter
	interpretProducts: Interpreter
	interpretStringsAndElements: Interpreter
	interpretConstructWithParameterAfter: (name: string, externalArgument: ExpressionNode, internalArguments: ExpressionNode[], context: InterpreterContext) => ExpressionNode
}
