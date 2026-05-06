import { removeWhitespace } from '@step-wise/utils'

import { InterpretationSettings } from '../settings'
import type { InputValuePart, ExpressionInputValue } from '../types'
import { getExpressionValueWith, addExpressionType } from '../utils'

import { processFunctionsAndAccents, processSubSups, processFractions } from './steps'

export function stringToInputValue(str: string, settings: InterpretationSettings): ExpressionInputValue {
	return addExpressionType(stringToInputValueParts(str, settings))
}

function stringToInputValueParts(str: string, settings: InterpretationSettings): InputValuePart[] {
	return processExpression(getExpressionValueWith(removeWhitespace(str)), settings)
}

// Process the expression in three steps: first sorting out functions/accents, then subscripts/superscripts, and finally fractions. Each part requires a different function for further processing.
function processExpression(value: InputValuePart[], settings: InterpretationSettings): InputValuePart[] {
	value = processFunctionsAndAccents(value, settings, (value: InputValuePart[], settings: InterpretationSettings) => addExpressionType(processExpression(value, settings)))
	value = processSubSups(value, settings, stringToInputValue)
	value = processFractions(value, settings, processExpression)
	return value
}
