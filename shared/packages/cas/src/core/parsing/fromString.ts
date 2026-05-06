import { type InterpretationSettings, stringToInputValue } from '@step-wise/math-input-value'

import { inputValueToExpressionNode } from './fromInputValue'

export function stringToExpressionNode(str: string, settings: InterpretationSettings) {
	return inputValueToExpressionNode(stringToInputValue(str, settings), settings)
}
