import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { processOptions, filterOptions, applyMapping } from 'step-wise/util'

import { Translation } from 'i18n'

import { MathInput, defaultMathInputOptions, mathInputFunctions } from '../MathInput'

import { keyboardSettings, errorToMessage } from './support'
import * as settings from './settings'
import * as validation from './validation'

export const style = (theme) => ({
	// Currently empty.
})
const useStyles = makeStyles((theme) => ({
	expressionInput: style(theme),
}))

const defaultExpressionInputOptions = {
	...defaultMathInputOptions,
	size: 's', // Expression Inputs are by default small.
	type: 'Expression',
	placeholder: <Translation path="inputs" entry="expressionInput.placeHolder">Expression</Translation>,
	keyboardSettings,
	errorToMessage,
}

export function ExpressionInput(options) {
	options = processOptions(options, defaultExpressionInputOptions)

	// Set up the options for the Math Input field.
	const classes = useStyles()
	const mathInputOptions = {
		...filterOptions(options, defaultMathInputOptions),
		className: clsx(options.className, classes.expressionInput, 'expressionInput'),
	}

	// Render everything.
	return <MathInput {...mathInputOptions} />
}
applyMapping(mathInputFunctions, (func, key) => { ExpressionInput[key] = func })
ExpressionInput.validation = validation
ExpressionInput.settings = settings
