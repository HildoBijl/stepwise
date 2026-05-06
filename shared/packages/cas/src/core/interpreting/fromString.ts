import { type InterpretationSettings, stringToInputValue } from '@step-wise/math-input-value'

import { inputValueToExpressionNode } from './fromInputValue'

// Turn a string into an ExpressionNode.
export function stringToExpressionNode(str: string, settings: InterpretationSettings) {
	return inputValueToExpressionNode(stringToInputValue(str, settings), settings)
}
