import { type ExpressionInputValue, isExpressionInputValue } from '@step-wise/math-input-value'

import { type ExpressionNode, inputValueToNode, stringToNode, number } from '../core'

import { type InterpretationSettingsInput, type ExpressionSettingsInput } from './settingsReexport'
import { type ExpressionInput } from './types'

type ExpressionParts = { node: ExpressionNode, expressionSettings?: ExpressionSettingsInput }

function interpretNode(node: ExpressionNode, expressionSettings?: ExpressionSettingsInput): ExpressionParts {
	const result: ExpressionParts = { node }
	if (expressionSettings) result.expressionSettings = expressionSettings
	return result
}

function interpretInputValue(value: ExpressionInputValue): ExpressionParts {
	return interpretNode(inputValueToNode(value), value.expressionSettings)
}

function interpretString(value: string, interpretationSettings?: InterpretationSettingsInput, expressionSettings?: ExpressionSettingsInput): ExpressionParts {
	return interpretNode(stringToNode(value, interpretationSettings, expressionSettings), expressionSettings)
}

export function isExpressionInput(value: unknown): value is ExpressionInput {
	return isExpressionInputValue(value) || typeof value === 'string' || typeof value === 'number'
}

export function interpretExpressionInput(value: ExpressionInput, interpretationSettings?: InterpretationSettingsInput, expressionSettings?: ExpressionSettingsInput): ExpressionParts {
	if (isExpressionInputValue(value)) return interpretInputValue(value)
	if (typeof value === 'string') return interpretString(value, interpretationSettings, expressionSettings)
	if (typeof value === 'number') return interpretNode(number(value), expressionSettings)
	throw new Error(`Invalid expression interpretation: cannot turn input of type "${typeof value}" into an expression.`)
}
