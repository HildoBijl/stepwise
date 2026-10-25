import React from 'react'

import { mergeDefaults, pickFromDefaults } from '@step-wise/js-utils'
import { withTranslation } from '@step-wise/i18n'

import { InputTranslation } from 'ui/inputs/InputTranslation'

import { MathInput, defaultMathInputOptions } from '../MathInput'

import { keyboardSettings, errorToMessage } from './support'
import * as settings from './settings'
import * as validation from './validation'

const defaultEquationInputOptions = {
	...defaultMathInputOptions,
	center: true, // Center equations in their input fields.
	size: 'l', // Equation Inputs are by default large.
	type: 'Equation',
	placeholder: <InputTranslation input="equationInput" id="placeHolder">Equation</InputTranslation>,
	keyboardSettings,
	errorToMessage,
}

function EquationInputBase(options) {
	options = mergeDefaults(options, defaultEquationInputOptions)

	// Force equals to be true in the settings to allow an equals sign.
	options.settings = {
		...options.settings,
		equals: true,
	}

	// Set up the options for the Math Input field.
	const mathInputOptions = pickFromDefaults(options, defaultMathInputOptions)

	// Render everything.
	return <MathInput {...mathInputOptions} />
}

export const EquationInput = Object.assign(withTranslation(EquationInputBase, {
	tag: 'equation-input',
	translatedProps: MathInput.translatableProps,
}), {
	validation,
	settings,
	translatableProps: MathInput.translatableProps,
})
