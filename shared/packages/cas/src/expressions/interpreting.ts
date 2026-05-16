import { type ExpressionInputValue, isExpressionInputValue } from '@step-wise/math-input-value'

import { type ExpressionNode, inputValueToNode, stringToNode, number } from '../core'

import { type InterpretationSettings, type ExpressionSettings } from './settings'
import { type ExpressionInput } from './types'

type ExpressionParts = { node: ExpressionNode, expressionSettings?: Partial<ExpressionSettings> }

function interpretNode(node: ExpressionNode, expressionSettings?: Partial<ExpressionSettings>): ExpressionParts {
	const result: ExpressionParts = { node }
	if (expressionSettings) result.expressionSettings = expressionSettings
	return result
}

function interpretInputValue(value: ExpressionInputValue): ExpressionParts {
	return interpretNode(inputValueToNode(value), value.expressionSettings)
}

function interpretString(value: string, interpretationSettings?: Partial<InterpretationSettings>, expressionSettings?: Partial<ExpressionSettings>): ExpressionParts {
	return interpretNode(stringToNode(value, interpretationSettings, expressionSettings), expressionSettings)
}

export function isExpressionInput(value: unknown): value is ExpressionInput {
	return isExpressionInputValue(value) || typeof value === 'string' || typeof value === 'number'
}

export function interpretExpressionInput(value: ExpressionInput, interpretationSettings?: Partial<InterpretationSettings>, expressionSettings?: Partial<ExpressionSettings>): ExpressionParts {
	if (isExpressionInputValue(value)) return interpretInputValue(value)
	if (typeof value === 'string') return interpretString(value, interpretationSettings, expressionSettings)
	if (typeof value === 'number') return interpretNode(number(value), expressionSettings)
	throw new Error(`Invalid expression interpretation: cannot turn input of type "${typeof value}" into an expression.`)
}
