import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { processOptions, filterOptions, applyMapping } from 'step-wise/util'

import { Translation } from 'i18n'

import { MathInput, defaultMathInputOptions } from '../MathInput'

import { keyboardSettings, errorToMessage } from './support'
import * as settings from './settings'
import * as validation from './validation'

export const style = (theme) => ({
	// Currently empty.
})
const useStyles = makeStyles((theme) => ({
	equationInput: style(theme),
}))

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
	const classes = useStyles()
	const mathInputOptions = {
		...filterOptions(options, defaultMathInputOptions),
		className: clsx(options.className, classes.equationInput, 'equationInput'),
	}

	// Render everything.
	return <MathInput {...mathInputOptions} />
}
EquationInput.validation = validation
EquationInput.settings = settings
EquationInput.translatableProps = MathInput.translatableProps
