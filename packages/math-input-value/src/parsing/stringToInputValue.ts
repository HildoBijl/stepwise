import { removeWhitespace } from '@step-wise/js-utils'

import { type InterpretationSettingsInput, type InterpretationSettings, type ExpressionSettingsInput, resolveInterpretationSettings } from '../settings'
import type { InputValue, ExpressionInputValue, EquationInputValue, ExpressionValue } from '../types'
import { addExpressionWrapper, addEquationWrapper } from '../utils'

import { processFunctionsAndAccents, processSubSups, processFractions } from './steps'

export function stringToInputValue(str: string, interpretationSettings?: InterpretationSettingsInput, expressionSettings?: ExpressionSettingsInput, toEquation?: false): ExpressionInputValue
export function stringToInputValue(str: string, interpretationSettings: InterpretationSettingsInput | undefined, expressionSettings: ExpressionSettingsInput | undefined, toEquation: true): EquationInputValue
export function stringToInputValue(str: string, interpretationSettings?: InterpretationSettingsInput, expressionSettings?: ExpressionSettingsInput, toEquation = false): InputValue {
	const settings = resolveInterpretationSettings(interpretationSettings)
	const value = stringToExpressionValue(str, settings)
	return toEquation ? addEquationWrapper(value, interpretationSettings, expressionSettings) : addExpressionWrapper(value, interpretationSettings, expressionSettings)
}

function stringToExpressionValue(str: string, settings: InterpretationSettings): ExpressionValue {
	return processExpression([removeWhitespace(str)], settings)
}

function processExpression(value: ExpressionValue, settings: InterpretationSettings): ExpressionValue {
	value = processFunctionsAndAccents(value, settings, processExpression)
	value = processSubSups(value, settings, stringToExpressionValue)
	value = processFractions(value, settings, processExpression)
	return value
}
