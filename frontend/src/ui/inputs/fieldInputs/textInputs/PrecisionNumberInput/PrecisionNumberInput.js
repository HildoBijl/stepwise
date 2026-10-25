import React from 'react'

import { mergeDefaults, pickFromDefaults } from '@step-wise/js-utils'
import { withTranslation } from '@step-wise/i18n'

import { InputTranslation } from 'ui/inputs/InputTranslation'

import { fieldInputTranslatedProps } from '../../FieldInput'
import { TextInput, defaultTextInputOptions } from '../TextInput'

import { type, initialValue, isEmpty, keyboardSettings, keyPressToFI, mouseClickToCursor, getStartCursor, getEndCursor, isCursorAtStart, isCursorAtEnd, clean, functionalize, errorToMessage } from './support'
import { PrecisionNumberInputInner } from './PrecisionNumberInputInner'
import * as validation from './validation'

export const defaultPrecisionNumberInputOptions = {
	...defaultTextInputOptions,

	// Settings from outside.
	placeholder: <InputTranslation input="precisionNumberInput" id="placeHolder">Precision number</InputTranslation>,
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

function PrecisionNumberInputBase(options) {
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

export const PrecisionNumberInput = Object.assign(withTranslation(PrecisionNumberInputBase, {
	tag: 'precision-number-input',
	translatedProps: fieldInputTranslatedProps,
}), {
	validation,
})
