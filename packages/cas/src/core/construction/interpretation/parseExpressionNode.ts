import { type InterpretationSettingsOptions, type ExpressionSettingsOptions, parseExpressionInputValue } from '@step-wise/math-input-value'

import { interpretExpressionInputValue } from './interpretExpressionInputValue'

// Turn a string into an ExpressionNode.
export function parseExpressionNode(input: string, interpretationSettings?: InterpretationSettingsOptions, expressionSettings?: ExpressionSettingsOptions) {
	return interpretExpressionInputValue(parseExpressionInputValue(input, interpretationSettings, expressionSettings))
}
