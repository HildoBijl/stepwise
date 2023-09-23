import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { processOptions, filterOptions } from 'step-wise/util'

import { MathInput, defaultMathInputOptions } from '../MathInput'

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
	placeholder: <>Uitdrukking</>,
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
ExpressionInput.validation = validation
ExpressionInput.settings = settings
