import { type InterpretationSettings, stringToInputValue } from '@step-wise/math-input-value'

import { inputValueToNode } from './fromInputValue'

// Turn a string into an ExpressionNode.
export function stringToNode(str: string, settings: InterpretationSettings) {
	return inputValueToNode(stringToInputValue(str, settings), settings)
}
