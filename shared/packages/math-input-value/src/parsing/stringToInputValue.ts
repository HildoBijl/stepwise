import { removeWhitespace } from '@step-wise/utils'

import { type InterpretationSettingsInput, type InterpretationSettings, type ExpressionSettingsInput, resolveInterpretationSettings } from '../settings'
import type { InputValuePart, InputValue, ExpressionInputValue, EquationInputValue } from '../types'
import { getExpressionValueWith, addExpressionWrapper, addEquationWrapper } from '../utils'

import { processFunctionsAndAccents, processSubSups, processFractions } from './steps'

export function stringToInputValue(str: string, interpretationSettings?: InterpretationSettingsInput, expressionSettings?: ExpressionSettingsInput, toEquation?: false): ExpressionInputValue
export function stringToInputValue(str: string, interpretationSettings: InterpretationSettingsInput | undefined, expressionSettings: ExpressionSettingsInput | undefined, toEquation: true): EquationInputValue
export function stringToInputValue(str: string, interpretationSettings?: InterpretationSettingsInput, expressionSettings?: ExpressionSettingsInput, toEquation = false): InputValue {
	const fullInterpretationSettings = resolveInterpretationSettings(interpretationSettings)
	const value = stringToInputValueParts(str, fullInterpretationSettings)
	return toEquation ? addEquationWrapper(value, interpretationSettings, expressionSettings) : addExpressionWrapper(value, interpretationSettings, expressionSettings)
}

function stringToInputValueParts(str: string, settings: InterpretationSettings): InputValuePart[] {
	return processExpression(getExpressionValueWith(removeWhitespace(str)), settings)
}

// Process the expression in three steps: first sorting out functions/accents, then subscripts/superscripts, and finally fractions. Each part requires a different function for further processing.
function processExpression(value: InputValuePart[], settings: InterpretationSettings): InputValuePart[] {
	value = processFunctionsAndAccents(value, settings, (value: InputValuePart[], settings: InterpretationSettings) => addExpressionWrapper(processExpression(value, settings)))
	value = processSubSups(value, settings, stringToInputValue)
	value = processFractions(value, settings, processExpression)
	return value
}
