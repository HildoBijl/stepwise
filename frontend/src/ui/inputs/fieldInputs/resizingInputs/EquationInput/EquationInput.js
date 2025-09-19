import React from 'react'

import { processOptions, filterOptions } from 'step-wise/util'

import { Translation } from 'i18n'

import { MathInput, defaultMathInputOptions } from '../MathInput'

import { keyboardSettings, errorToMessage } from './support'
import * as settings from './settings'
import * as validation from './validation'

const defaultEquationInputOptions = {
	...defaultMathInputOptions,
	center: true, // Center equations in their input fields.
	size: 'l', // Equation Inputs are by default large.
	type: 'Equation',
	placeholder: <Translation path="inputs" entry="equationInput.placeHolder">Equation</Translation>,
	keyboardSettings,
	errorToMessage,
}

export function EquationInput(options) {
	options = processOptions(options, defaultEquationInputOptions)

	// Force equals to be true in the settings to allow an equals sign.
	options.settings = {
		...options.settings,
		equals: true,
	}

	// Set up the options for the Math Input field.
	const mathInputOptions = filterOptions(options, defaultMathInputOptions)

	// Render everything.
	return <MathInput {...mathInputOptions} />
}
EquationInput.validation = validation
EquationInput.settings = settings
EquationInput.translatableProps = MathInput.translatableProps
