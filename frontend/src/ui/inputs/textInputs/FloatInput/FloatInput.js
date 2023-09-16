import React from 'react'
import clsx from 'clsx'

import { processOptions, filterOptions } from 'step-wise/util'

import { TextInput, defaultTextInputOptions } from '../TextInput'

import { type, initialValue, isEmpty, FIToKeyboardSettings, keyPressToFI, mouseClickToCursor, getStartCursor, getEndCursor, isCursorAtStart, isCursorAtEnd, clean, functionalize, errorToMessage } from './support'
import { FloatInputInner } from './FloatInputInner'
import * as validation from './validation'

export const defaultFloatInputOptions = {
	...defaultTextInputOptions,

	// Settings from outside.
	placeholder: <>Kommagetal</>,
	positive: false,
	allowPower: true,
	validate: validation.any,

	// Functionalities.
	type,
	initialValue,
	isEmpty,
	keyboardSettings: FIToKeyboardSettings,
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
		keyPressToFI: (keyInfo, FI) => keyPressToFI(keyInfo, FI, positive, allowPower),
		keyboardSettings: (FI) => FIToKeyboardSettings(FI, positive, allowPower),
		className: clsx(options.className, 'floatInput'),
	}

	// Render the TextInput.
	return <TextInput {...textInputOptions}>
		<FloatInputInner />
	</TextInput>
}
FloatInput.validation = validation
