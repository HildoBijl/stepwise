import React from 'react'
import clsx from 'clsx'

import { processOptions, filterOptions } from 'step-wise/util'

import { TextInput, defaultTextInputOptions } from '../TextInput'

import { type, initialValue, isEmpty, getStartCursor, getEndCursor, isCursorAtStart, isCursorAtEnd, mouseClickToCursor, keyboardSettings, keyPressToFI, errorToMessage } from './support'
import { IntegerInputInner } from './IntegerInputInner'
import * as validation from './validation'

export const defaultIntegerInputOptions = {
	...defaultTextInputOptions,

	// Settings from outside.
	placeholder: <>Geheel getal</>,
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
	errorToMessage,
}

export function IntegerInput(options) {
	options = processOptions(options, defaultIntegerInputOptions)

	// Set up options for the TextInput field.
	const { positive } = options
	const textInputOptions = {
		...filterOptions(options, defaultTextInputOptions),
		keyPressToFI: (keyInfo, FI) => keyPressToFI(keyInfo, FI, positive),
		keyboardSettings: (FI) => keyboardSettings(FI, positive),
		className: clsx(options.className, 'integerInput'),
	}

	// Render the TextInput.
	return <TextInput {...textInputOptions}>
		<IntegerInputInner />
	</TextInput>
}
IntegerInput.validation = validation
