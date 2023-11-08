import { Translation } from 'i18n'

import { keyboardSettings, errorToMessage as expressionErrorToMessage } from '../ExpressionInput'

const translationPath = 'inputs'
const translationEntry = 'equationInput.validation'

// keyboardSettings are the same as for the ExpressionInput.
export { keyboardSettings }

// errorToMessage turns an error during interpretation into a message to be displayed.
export function errorToMessage(error) {
	switch (error.code) {
		// Equation interpretation.
		case 'EmptyEquation':
			return <Translation path={translationPath} entry={`${translationEntry}.emptyEquation`}>There's (part of) an equation missing here.</Translation>
		case 'MultipleEqualsSigns':
			return <Translation path={translationPath} entry={`${translationEntry}.multipleEqualsSigns`}>The equation has multiple "=" characters.</Translation>
		case 'MissingEqualsSign':
			return <Translation path={translationPath} entry={`${translationEntry}.missingEqualsSign`}>The equation has no "=" character.</Translation>

		// Expression interpretation.
		default: return expressionErrorToMessage(error)
	}
}
