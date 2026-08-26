import { type InterpretationSettingsOptions, type ExpressionSettingsOptions, parseExpressionInputValue } from '@step-wise/math-input-value'

import { inputValueToNode } from './fromInputValue'

// Turn a string into an ExpressionNode.
export function stringToNode(str: string, interpretationSettings?: InterpretationSettingsOptions, expressionSettings?: ExpressionSettingsOptions) {
	return inputValueToNode(parseExpressionInputValue(str, interpretationSettings, expressionSettings))
}
