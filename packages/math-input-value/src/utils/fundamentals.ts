import { first, isEmptyObject, omitDefaults } from '@step-wise/js-utils'

import { type InterpretationSettingsOptions, type ExpressionSettingsOptions, defaultInterpretationSettings, defaultExpressionSettings } from '../settings'
import { type ExpressionInputValue, type EquationInputValue, type InputValue, type ExpressionValue, isExpressionValue } from '../types'

export function isEmptyExpressionValue(value: ExpressionValue): boolean {
	if (value.length === 0) throw new Error(`Invalid expression InputValue: it can never be an empty array. There must always be at least one text part.`)
	return value.length === 1 && first(value) === ''
}

export function createEmptyExpressionValue(): ExpressionValue {
	return ['']
}

export function createEmptyExpressionInputValue(): ExpressionInputValue {
	return createExpressionInputValueFromText('')
}

export function createExpressionInputValue(value: ExpressionValue, interpretationSettings?: InterpretationSettingsOptions, expressionSettings?: ExpressionSettingsOptions): ExpressionInputValue {
	if (!isExpressionValue(value)) throw new TypeError('Cannot wrap an invalid expression value.')
	const result: ExpressionInputValue = { type: 'Expression', value }
	return addNonDefaultSettings(result, interpretationSettings, expressionSettings)
}

export function createEquationInputValue(value: ExpressionValue, interpretationSettings?: InterpretationSettingsOptions, expressionSettings?: ExpressionSettingsOptions): EquationInputValue {
	if (!isExpressionValue(value)) throw new TypeError('Cannot wrap an invalid expression value.')
	const result: EquationInputValue = { type: 'Equation', value }
	return addNonDefaultSettings(result, interpretationSettings, expressionSettings)
}

export function createExpressionInputValueFromText(value: string): ExpressionInputValue {
	return createExpressionInputValue([value])
}

function addNonDefaultSettings<T extends InputValue>(value: T, interpretationSettings?: InterpretationSettingsOptions, expressionSettings?: ExpressionSettingsOptions): T {
	if (interpretationSettings !== undefined) {
		interpretationSettings = omitDefaults(interpretationSettings, defaultInterpretationSettings)
		if (!isEmptyObject(interpretationSettings)) value.interpretationSettings = interpretationSettings
	}
	if (expressionSettings !== undefined) {
		expressionSettings = omitDefaults(expressionSettings, defaultExpressionSettings)
		if (!isEmptyObject(expressionSettings)) value.expressionSettings = expressionSettings
	}
	return value
}
