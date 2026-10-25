import React from 'react'
import clsx from 'clsx'

import { mergeDefaults, pickFromDefaults } from '@step-wise/js-utils'
import { withTranslation } from '@step-wise/i18n'

import { InputTranslation } from 'ui/inputs/InputTranslation'

import { fieldInputTranslatedProps } from '../../FieldInput'
import { TextInput, defaultTextInputOptions } from '../TextInput'

import { type, initialValue, isEmpty, getStartCursor, getEndCursor, isCursorAtStart, isCursorAtEnd, mouseClickToCursor, keyboardSettings, keyPressToFI, clean, functionalize, errorToMessage } from './support'
import { IntegerInputInner } from './IntegerInputInner'
import * as validation from './validation'

export const defaultIntegerInputOptions = {
	...defaultTextInputOptions,

	// Settings from outside.
	placeholder: <InputTranslation input="integerInput" id="placeHolder">Integer number</InputTranslation>,
	positive: false,
	validate: validation.any,

	// Functionalities.
	type,
	initialValue,
	isEmpty,
	keyboardSettings,
	keyPressToFI,
	mouseClickToCursor,
	getStartCursor,
	getEndCursor,
	isCursorAtStart,
	isCursorAtEnd,
	clean,
	functionalize,
	errorToMessage,
}

function IntegerInputBase(options) {
	options = mergeDefaults(options, defaultIntegerInputOptions)

	// Set up options for the TextInput field.
	const { positive } = options
	const textInputOptions = {
		...pickFromDefaults(options, defaultTextInputOptions),
		keyPressToFI: (keyInfo, FI, contentsElement) => keyPressToFI(keyInfo, FI, contentsElement, positive),
		keyboardSettings: (FI) => keyboardSettings(FI, positive),
		className: clsx(options.className, 'integerInput'),
	}

	// Render the TextInput.
	return <TextInput {...textInputOptions}>
		<IntegerInputInner />
	</TextInput>
}

export const IntegerInput = Object.assign(withTranslation(IntegerInputBase, {
	tag: 'integer-input',
	translatedProps: fieldInputTranslatedProps,
}), {
	validation,
})
