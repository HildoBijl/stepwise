import React from 'react'

import { equationSItoFO, support } from 'step-wise/CAS'

import { selectRandomEmpty } from 'util/feedbackMessages'

import { getInterpretationErrorMessage } from './support/expressionTypes/support/interpretationError'

import ExpressionInput, { validWithVariablesGeneric } from './ExpressionInput'

const { getEmpty, isEmpty, getStartCursor } = support

const equationProps = {
	label: 'Vul hier de vergelijking in',
	placeholder: '',
	center: true, // Center equations in their input fields.
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
export function validWithVariables(...variables) {
	// This validation function is special, in the sense that it's a function that returns a validation function. Give it a set of variables that are accepted, and it checks that only those variables are used.
	return validWithVariablesGeneric(equationSItoFO, ...variables)
}

// getEmptyData returns an empty data object, ready to be filled by input.
export function getEmptyData(settings = {}) {
	return {
		type: 'Equation',
		value: getEmpty(),
		cursor: getStartCursor(),
		settings,
	}
}

// isValid checks if this IO is valid.
export function isValid(value) {
	return getValidityMessage(value) === undefined
}

// getValidityMessage takes an Equation value and checks whether it is valid. If not, it gives a message explaining a problem. If it is valid, nothing is returned.
export function getValidityMessage(value) {
	try {
		equationSItoFO(value)
	} catch (e) {
		return getInterpretationErrorMessage(e)
	}
}