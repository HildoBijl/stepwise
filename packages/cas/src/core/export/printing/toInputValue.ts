import { type ExpressionSettingsInput, type ExpressionInputValue, stringToInputValue } from '@step-wise/math-input-value'

import { type ExpressionNode } from '../../construction'

import { getNodeInterpretationSettingsInput } from './getInterpretationSettings'
import { nodeToString } from './toString'

export function nodeToInputValue(node: ExpressionNode, interpretationSettings = getNodeInterpretationSettingsInput(node), expressionSettings?: ExpressionSettingsInput): ExpressionInputValue {
	return stringToInputValue(nodeToString(node, interpretationSettings), interpretationSettings, expressionSettings)
}
