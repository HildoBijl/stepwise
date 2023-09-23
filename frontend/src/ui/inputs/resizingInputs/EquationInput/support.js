import { keyboardSettings, errorToMessage as expressionErrorToMessage } from '../ExpressionInput'

// keyboardSettings are the same as for the ExpressionInput.
export { keyboardSettings }

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
