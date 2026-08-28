import { type ExpressionInputValue, isExpressionInputValue } from '@step-wise/math-input-value'

import { type ExpressionNode, interpretExpressionInputValue, parseExpressionNode, number } from '../core/index.ts'

import { type InterpretationSettingsOptions, type ExpressionSettingsOptions } from './settings.ts'
import { type ExpressionInput } from './types.ts'

type ExpressionParts = { node: ExpressionNode, expressionSettings?: ExpressionSettingsOptions }

function interpretNode(node: ExpressionNode, expressionSettings?: ExpressionSettingsOptions): ExpressionParts {
	const result: ExpressionParts = { node }
	if (expressionSettings) result.expressionSettings = expressionSettings
	return result
}

function interpretInputValue(value: ExpressionInputValue, interpretationSettings?: InterpretationSettingsOptions, expressionSettings?: ExpressionSettingsOptions): ExpressionParts {
	const mergedInterpretationSettings = { ...value.interpretationSettings, ...interpretationSettings }
	const mergedExpressionSettings = { ...value.expressionSettings, ...expressionSettings }
	const adjustedValue: ExpressionInputValue = {
		...value,
		...(Object.keys(mergedInterpretationSettings).length === 0 ? {} : { interpretationSettings: mergedInterpretationSettings }),
		...(Object.keys(mergedExpressionSettings).length === 0 ? {} : { expressionSettings: mergedExpressionSettings }),
	}
	return interpretNode(interpretExpressionInputValue(adjustedValue), Object.keys(mergedExpressionSettings).length === 0 ? undefined : mergedExpressionSettings)
}

function interpretString(value: string, interpretationSettings?: InterpretationSettingsOptions, expressionSettings?: ExpressionSettingsOptions): ExpressionParts {
	return interpretNode(parseExpressionNode(value, interpretationSettings, expressionSettings), expressionSettings)
}

export function isExpressionInput(value: unknown): value is ExpressionInput {
	return isExpressionInputValue(value) || typeof value === 'string' || typeof value === 'number'
}

export function interpretExpressionInput(value: ExpressionInput, interpretationSettings?: InterpretationSettingsOptions, expressionSettings?: ExpressionSettingsOptions): ExpressionParts {
	if (isExpressionInputValue(value)) return interpretInputValue(value, interpretationSettings, expressionSettings)
	if (typeof value === 'string') return interpretString(value, interpretationSettings, expressionSettings)
	if (typeof value === 'number') return interpretNode(number(value), expressionSettings)
	throw new Error(`Invalid expression interpretation: cannot turn input of type "${typeof value}" into an expression.`)
}
