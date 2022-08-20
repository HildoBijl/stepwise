import React from 'react'

import { isEmptyObject } from 'step-wise/util/objects'
import { support } from 'step-wise/CAS'

import ExpressionInput, { numeric as expressionNumeric, validWithVariables, errorToMessage as expressionErrorToMessage } from './ExpressionInput'

const { getEmpty, isEmpty } = support

const equationProps = {
	label: 'Vul hier de vergelijking in',
	placeholder: '',
	center: true, // Center equations in their input fields.
	initialSI: getEmptySI(),
	isEmpty: FI => isEmpty(FI.value),
	errorToMessage,
}

export default function EquationInput(props) {
	// Make sure that the settings allow for an equals sign.
	const settings = {
		...(props.settings || {}),
		equals: true,
	}

	// Set up the properties and apply them.
	props = {
		...equationProps,
		...props,
		settings
	}
	return <ExpressionInput {...props} />
}

// These are validation functions.
export function numeric(equation) {
	return expressionNumeric(equation.left) || expressionNumeric(equation.right)
}
export { validWithVariables } // This is the same as for Expressions.

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