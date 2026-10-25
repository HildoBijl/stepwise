import React from 'react'

import { mergeDefaults, pickFromDefaults } from '@step-wise/js-utils'
import { withTranslation } from '@step-wise/i18n'

import { InputTranslation } from 'ui/inputs/InputTranslation'

import { fieldInputTranslatedProps } from '../../FieldInput'
import { MathInput, defaultMathInputOptions } from '../MathInput'

import { keyboardSettings, errorToMessage } from './support'
import * as settings from './settings'
import * as validation from './validation'

const defaultExpressionInputOptions = {
	...defaultMathInputOptions,
	size: 's', // Expression Inputs are by default small.
	type: 'Expression',
	placeholder: <InputTranslation input="expressionInput" id="placeHolder">Expression</InputTranslation>,
	keyboardSettings,
	errorToMessage,
}

function ExpressionInputBase(options) {
	options = mergeDefaults(options, defaultExpressionInputOptions)

	// Set up the options for the Math Input field.
	const mathInputOptions = pickFromDefaults(options, defaultMathInputOptions)

	// Render everything.
	return <MathInput {...mathInputOptions} />
}

export const ExpressionInput = Object.assign(withTranslation(ExpressionInputBase, {
	tag: 'expression-input',
	translatedProps: fieldInputTranslatedProps,
}), {
	validation,
	settings,
})
