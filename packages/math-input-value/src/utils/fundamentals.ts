import { first, isPlainObject, isEmptyObject, omitDefaults } from '@step-wise/utils'

import { type InterpretationSettingsInput, type ExpressionSettingsInput, defaultInterpretationSettings, defaultExpressionSettings } from '../settings'
import type { ExpressionInputValue, EquationInputValue, InputValue, ExpressionValue } from '../types'

export function isExpressionInputValue(element: unknown): element is ExpressionInputValue {
	return isPlainObject(element) && element.type === 'Expression' && Array.isArray(element.value)
}

export function isEquationInputValue(element: unknown): element is EquationInputValue {
	return isPlainObject(element) && element.type === 'Equation' && Array.isArray(element.value)
}

export function isTextPart(element: unknown): element is string {
	return typeof element === 'string'
}

export function isEmptyExpressionValue(value: ExpressionValue): boolean {
	if (value.length === 0) throw new Error(`Invalid expression InputValue: it can never be an empty array. There must always be at least one text part.`)
	return value.length === 1 && first(value) === ''
}

export function getEmptyExpressionValue(): ExpressionValue {
	return ['']
}

export function getEmptyExpression(): ExpressionInputValue {
	return getExpressionWith('')
}

export function addExpressionWrapper(value: ExpressionValue, interpretationSettings?: InterpretationSettingsInput, expressionSettings?: ExpressionSettingsInput): ExpressionInputValue {
	const result: ExpressionInputValue = { type: 'Expression', value }
	return addPotentialSettings(result, interpretationSettings, expressionSettings)
}

export function addEquationWrapper(value: ExpressionValue, interpretationSettings?: InterpretationSettingsInput, expressionSettings?: ExpressionSettingsInput): EquationInputValue {
	const result: EquationInputValue = { type: 'Equation', value }
	return addPotentialSettings(result, interpretationSettings, expressionSettings)
}

export function getExpressionWith(value: string): ExpressionInputValue {
	return addExpressionWrapper([value])
}

function addPotentialSettings<T extends InputValue>(value: T, interpretationSettings?: InterpretationSettingsInput, expressionSettings?: ExpressionSettingsInput): T {
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
