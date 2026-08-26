import { removeWhitespace } from '@step-wise/js-utils'

import { type InterpretationSettingsOptions, type InterpretationSettings, type ExpressionSettingsOptions, resolveInterpretationSettings } from '../settings'
import type { ExpressionInputValue, EquationInputValue, ExpressionValue } from '../types'
import { createExpressionInputValue, createEquationInputValue } from '../utils'

import { parseFunctionsAndAccents, parseSubSups, parseFractions } from './steps'

export function parseExpressionInputValue(source: string, interpretationSettings?: InterpretationSettingsOptions, expressionSettings?: ExpressionSettingsOptions): ExpressionInputValue {
	const settings = resolveInterpretationSettings(interpretationSettings)
	return createExpressionInputValue(parseExpressionValue(source, settings), interpretationSettings, expressionSettings)
}

export function parseEquationInputValue(source: string, interpretationSettings?: InterpretationSettingsOptions, expressionSettings?: ExpressionSettingsOptions): EquationInputValue {
	const settings = resolveInterpretationSettings(interpretationSettings)
	return createEquationInputValue(parseExpressionValue(source, settings), interpretationSettings, expressionSettings)
}

function parseExpressionValue(source: string, settings: InterpretationSettings): ExpressionValue {
	return parseExpressionValueParts([removeWhitespace(source)], settings)
}

function parseExpressionValueParts(value: ExpressionValue, settings: InterpretationSettings): ExpressionValue {
	value = parseFunctionsAndAccents(value, settings, parseExpressionValueParts)
	value = parseSubSups(value, settings, parseExpressionValue)
	value = parseFractions(value, settings, parseExpressionValueParts)
	return value
}
