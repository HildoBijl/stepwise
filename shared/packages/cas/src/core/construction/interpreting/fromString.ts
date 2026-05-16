import { type InterpretationSettings, type ExpressionSettings, stringToInputValue } from '@step-wise/math-input-value'

import { inputValueToNode } from './fromInputValue'

// Turn a string into an ExpressionNode.
export function stringToNode(str: string, interpretationSettings?: Partial<InterpretationSettings>, expressionSettings?: Partial<ExpressionSettings>) {
	return inputValueToNode(stringToInputValue(str, interpretationSettings, expressionSettings))
}
