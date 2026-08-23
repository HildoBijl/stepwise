import React from 'react'

import { mergeDefaults, pickFromDefaults } from '@step-wise/js-utils'

import { Translation } from 'i18n'

import { TextInput, defaultTextInputOptions } from '../TextInput'

import { type, initialValue, isEmpty, keyboardSettings, keyPressToFI, mouseClickToCursor, getStartCursor, getEndCursor, isCursorAtStart, isCursorAtEnd, clean, functionalize, errorToMessage } from './support'
import { PrecisionNumberInputInner } from './PrecisionNumberInputInner'
import * as validation from './validation'

export const defaultPrecisionNumberInputOptions = {
	...defaultTextInputOptions,

	// Settings from outside.
	placeholder: <Translation path="inputs" entry="precisionNumberInput.placeHolder">Precision number</Translation>,
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

export function PrecisionNumberInput(options) {
	options = mergeDefaults(options, defaultPrecisionNumberInputOptions)

	// Set up options for the TextInput field.
	const { positive, allowPower } = options
	const textInputOptions = {
		...pickFromDefaults(options, defaultTextInputOptions),
		keyPressToFI: (keyInfo, FI, contentsElement) => keyPressToFI(keyInfo, FI, contentsElement, positive, allowPower),
		keyboardSettings: (FI) => keyboardSettings(FI, positive, allowPower),
	}

	// Render the TextInput.
	return <TextInput {...textInputOptions}>
		<PrecisionNumberInputInner />
	</TextInput>
}
PrecisionNumberInput.validation = validation
PrecisionNumberInput.translatableProps = TextInput.translatableProps
