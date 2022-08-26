import React from 'react'

import { isEmpty } from 'step-wise/CAS/interpretation/support'

import ExpressionInput from './ExpressionInput'

import { getEmptySI, errorToMessage } from './support'

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
