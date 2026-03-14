import React from 'react'

import { mergeDefaults, pickFromDefaults } from '@step-wise/utils'

import { Translation } from 'i18n'

import { MathInput, defaultMathInputOptions } from '../MathInput'

import { keyboardSettings, errorToMessage } from './support'
import * as settings from './settings'
import * as validation from './validation'

const defaultExpressionInputOptions = {
	...defaultMathInputOptions,
	size: 's', // Expression Inputs are by default small.
	type: 'Expression',
	placeholder: <Translation path="inputs" entry="expressionInput.placeHolder">Expression</Translation>,
	keyboardSettings,
	errorToMessage,
}

export function ExpressionInput(options) {
	options = mergeDefaults(options, defaultExpressionInputOptions)

	// Set up the options for the Math Input field.
	const mathInputOptions = pickFromDefaults(options, defaultMathInputOptions)

	// Render everything.
	return <MathInput {...mathInputOptions} />
}
ExpressionInput.validation = validation
ExpressionInput.settings = settings
ExpressionInput.translatableProps = MathInput.translatableProps
