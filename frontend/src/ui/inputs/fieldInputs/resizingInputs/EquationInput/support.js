import { InputTranslation } from 'ui/inputs/InputTranslation'

import { keyboardSettings, errorToMessage as expressionErrorToMessage } from '../ExpressionInput'

// keyboardSettings are the same as for the ExpressionInput.
export { keyboardSettings }

// errorToMessage turns an error during interpretation into a message to be displayed.
export function errorToMessage(error) {
	switch (error.code) {
		// Equation interpretation.
		case 'EmptyEquation':
			return <InputTranslation input="equationInput" group={['validation']} id="emptyEquation">There's (part of) an equation missing here.</InputTranslation>
		case 'MultipleEqualsSigns':
			return <InputTranslation input="equationInput" group={['validation']} id="multipleEqualsSigns">The equation has multiple "=" characters.</InputTranslation>
		case 'MissingEqualsSign':
			return <InputTranslation input="equationInput" group={['validation']} id="missingEqualsSign">The equation has no "=" character.</InputTranslation>

		// Expression interpretation.
		default: return expressionErrorToMessage(error)
	}
}
