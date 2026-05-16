import { mergeDefaults, removeWhitespace } from '@step-wise/utils'

import { type InterpretationSettings, type ExpressionSettings, defaultInterpretationSettings } from '../settings'
import type { InputValuePart, ExpressionInputValue } from '../types'
import { getExpressionValueWith, addExpressionWrapper } from '../utils'

import { processFunctionsAndAccents, processSubSups, processFractions } from './steps'

export function stringToInputValue(str: string, interpretationSettings?: Partial<InterpretationSettings>, expressionSettings?: Partial<ExpressionSettings>): ExpressionInputValue {
	const fullInterpretationSettings = mergeDefaults(interpretationSettings ?? {}, defaultInterpretationSettings)
	return addExpressionWrapper(stringToInputValueParts(str, fullInterpretationSettings), interpretationSettings, expressionSettings)
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
