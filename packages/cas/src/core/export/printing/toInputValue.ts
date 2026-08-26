import { type ExpressionSettingsOptions, type ExpressionInputValue, parseExpressionInputValue } from '@step-wise/math-input-value'

import { type ExpressionNode } from '../../construction'

import { getNodeInterpretationSettingsInput } from './getInterpretationSettings'
import { nodeToString } from './toString'

export function nodeToInputValue(node: ExpressionNode, interpretationSettings = getNodeInterpretationSettingsInput(node), expressionSettings?: ExpressionSettingsOptions): ExpressionInputValue {
	return parseExpressionInputValue(nodeToString(node, interpretationSettings), interpretationSettings, expressionSettings)
}
