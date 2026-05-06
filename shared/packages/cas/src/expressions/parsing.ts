import { mergeDefaults } from '@step-wise/utils'
import { type InterpretationSettings, type ExpressionSettings, defaultInterpretationSettings } from '@step-wise/math-input-value'

import { stringToExpressionNode } from '../core'

import { Expression } from './Expression'

export function asExpression(str: string, interpretationSettings: Partial<InterpretationSettings> = {}, expressionSettings: Partial<ExpressionSettings> = {}) {
	const expressionNode = stringToExpressionNode(str, mergeDefaults(interpretationSettings, defaultInterpretationSettings))
	return new Expression(expressionNode, expressionSettings)
}
