import type { InputValuePart, InterpretationSettings } from '@step-wise/math-input-value'

import type { ExpressionNode } from '../nodes'

export type InterpretationPart = InputValuePart | ExpressionNode

type Interpreter = (value: InterpretationPart[], context: InterpreterContext) => ExpressionNode
export type InterpreterContext = {
	interpretationSettings: InterpretationSettings
	interpretBrackets: (value: InputValuePart[], context: InterpreterContext) => ExpressionNode
	interpretSums: Interpreter
	interpretProducts: Interpreter
	interpretParts: Interpreter
}
