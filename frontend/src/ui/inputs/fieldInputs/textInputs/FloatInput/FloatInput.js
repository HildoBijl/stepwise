import React from 'react'

import { processOptions, filterOptions } from 'step-wise/util'

import { Translation } from 'i18n'

import { TextInput, defaultTextInputOptions } from '../TextInput'

import { type, initialValue, isEmpty, keyboardSettings, keyPressToFI, mouseClickToCursor, getStartCursor, getEndCursor, isCursorAtStart, isCursorAtEnd, clean, functionalize, errorToMessage } from './support'
import { FloatInputInner } from './FloatInputInner'
import * as validation from './validation'

export const defaultFloatInputOptions = {
	...defaultTextInputOptions,

	// Settings from outside.
	placeholder: <Translation path="inputs" entry="floatInput.placeHolder">Floating point number</Translation>,
	positive: false,
	allowPower: true,
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

export function FloatInput(options) {
	options = processOptions(options, defaultFloatInputOptions)

	// Set up options for the TextInput field.
	const { positive, allowPower } = options
	const textInputOptions = {
		...filterOptions(options, defaultTextInputOptions),
		keyPressToFI: (keyInfo, FI, contentsElement) => keyPressToFI(keyInfo, FI, contentsElement, positive, allowPower),
		keyboardSettings: (FI) => keyboardSettings(FI, positive, allowPower),
	}

	// Render the TextInput.
	return <TextInput {...textInputOptions}>
		<FloatInputInner />
	</TextInput>
}
FloatInput.validation = validation
FloatInput.translatableProps = TextInput.translatableProps
