import { mergeDefaults } from '@step-wise/utils'
import { type InterpretationSettings, type ExpressionSettings, defaultInterpretationSettings } from '@step-wise/math-input-value'

import { stringToNode, number } from '../core'

import { Expression } from './Expression'

export function asExpression(value: string | number, interpretationSettings: Partial<InterpretationSettings> = {}, expressionSettings: Partial<ExpressionSettings> = {}) {
	let expressionNode
	if (typeof value === 'string') expressionNode = stringToNode(value, mergeDefaults(interpretationSettings, defaultInterpretationSettings))
	else if (typeof value === 'number') expressionNode = number(value)
	else throw new Error(`Invalid asExpression case: received a value of type "${typeof value}".`)
	return new Expression(expressionNode, expressionSettings)
}
