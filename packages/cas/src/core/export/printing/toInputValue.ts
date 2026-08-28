import { type ExpressionSettingsOptions, type ExpressionInputValue, parseExpressionInputValue } from '@step-wise/math-input-value'

import { type ExpressionNode } from '../../construction/index.ts'

import { inferInterpretationSettingsOptions } from './inferInterpretationSettings.ts'
import { nodeToString } from './toString.ts'

export function nodeToInputValue(node: ExpressionNode, interpretationSettings = inferInterpretationSettingsOptions(node), expressionSettings?: ExpressionSettingsOptions): ExpressionInputValue {
	return parseExpressionInputValue(nodeToString(node, interpretationSettings), interpretationSettings, expressionSettings)
}
