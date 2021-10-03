import React from 'react'

import { selectRandomEmpty } from 'step-wise/util/random'
import { getEmpty, isEmpty } from 'step-wise/inputTypes/Equation'
import { interpretEquationValue } from 'step-wise/inputTypes/Expression/interpreter/Equation'
import { getInterpretationErrorMessage } from 'step-wise/inputTypes/Expression/interpreter/InterpretationError'

import Equation from './support/expressionTypes/Equation'

import ExpressionInput from './ExpressionInput'

const equationProps = {
	placeholder: 'Vergelijking',
	validate: nonEmptyAndValid,
	initialData: getEmptyData(),
	isEmpty: data => isEmpty(data.value),
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
export function nonEmpty(data) {
	const { value } = data
	if (isEmpty(value))
		return selectRandomEmpty()
}
export function nonEmptyAndValid(data) {
	// Check if it's empty first.
	const nonEmptyResult = nonEmpty(data)
	if (nonEmptyResult)
		return nonEmptyResult

	// Interpret it and see if there are problems.
	const { value } = data
	const validityResult = getValidityMessage(value)
	if (validityResult)
		return validityResult
}

// getEmptyData returns an empty data object, ready to be filled by input.
export function getEmptyData() {
	return {
		type: 'Equation',
		value: getEmpty(),
		cursor: Equation.getStartCursor(),
	}
}

// isValid checks if this IO is valid.
export function isValid(value) {
	return getValidityMessage(value) === undefined
}

// getValidityMessage takes an Equation value and checks whether it is valid. If not, it gives a message explaining a problem. If it is valid, nothing is returned.
export function getValidityMessage(value) {
	try {
		interpretEquationValue(value)
	} catch (e) {
		return getInterpretationErrorMessage(e)
	}
}