import { isEmptyObject } from 'step-wise/util/objects'
import { getEmpty } from 'step-wise/CAS/interpretation/support'

import { errorToMessage as expressionErrorToMessage } from './ExpressionInput'

// getEmptyData returns an empty data object, ready to be filled by input.
export function getEmptySI(settings = {}) {
	const result = {
		type: 'Equation',
		value: getEmpty(),
	}
	if (!isEmptyObject(settings))
		result.settings = settings
	return result
}

// errorToMessage turns an error during interpretation into a message to be displayed.
export function errorToMessage(error) {
	switch (error.code) {
		// Equation interpretation.
		case 'EmptyEquation':
			return `Er is geen vergelijking ingevuld.`
		case 'MultipleEqualsSigns':
			return `De vergelijking heeft meerdere "=" tekens.`
		case 'MissingEqualsSign':
			return `De vergelijking heeft geen "=" teken.`

		// Expression interpretation.
		default: return expressionErrorToMessage(error)
	}
}
