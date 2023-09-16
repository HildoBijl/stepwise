import React from 'react'
import clsx from 'clsx'

import { processOptions, filterOptions } from 'step-wise/util'

import { TextInput, defaultTextInputOptions } from '../../TextInput'

import { emptySI, isEmpty, getStartCursor, getEndCursor, isCursorAtStart, isCursorAtEnd, mouseClickToCursor, FIToKeyboardSettings, keyPressToFI, errorToMessage } from '../support'

import IntegerInputInner from './IntegerInputInner'

const defaultIntegerInputOptions = {
	...defaultTextInputOptions,

	// Settings from outside.
	placeholder: <>Geheel getal</>,
	positive: false,
	validate: undefined,
	initialSI: emptySI,

	// Functionalities.
	isEmpty: SI => isEmpty(SI.value),
	keyboardSettings: FIToKeyboardSettings,
	keyPressToFI,
	mouseClickToCursor,
	getStartCursor,
	getEndCursor,
	isCursorAtStart,
	isCursorAtEnd,
	errorToMessage,
}

export default function IntegerInput(options) {
	options = processOptions(options, defaultIntegerInputOptions)

	// Set up options for the TextInput field.
	const positive = options.positive !== undefined ? options.positive : defaultIntegerInputOptions.positive
	const textInputOptions = {
		...filterOptions(options, defaultTextInputOptions),
		keyPressToFI: (keyInfo, FI) => keyPressToFI(keyInfo, FI, positive),
		keyboardSettings: (FI) => FIToKeyboardSettings(FI, positive),
		className: clsx(options.className, 'integerInput'),
	}

	// Render the TextInput.
	return <TextInput {...textInputOptions}>
		<IntegerInputInner />
	</TextInput>
}
