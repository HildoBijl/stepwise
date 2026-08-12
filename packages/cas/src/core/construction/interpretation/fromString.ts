import { type InterpretationSettingsInput, type ExpressionSettingsInput, stringToInputValue } from '@step-wise/math-input-value'

import { inputValueToNode } from './fromInputValue'

// Turn a string into an ExpressionNode.
export function stringToNode(str: string, interpretationSettings?: InterpretationSettingsInput, expressionSettings?: ExpressionSettingsInput) {
	return inputValueToNode(stringToInputValue(str, interpretationSettings, expressionSettings))
}
