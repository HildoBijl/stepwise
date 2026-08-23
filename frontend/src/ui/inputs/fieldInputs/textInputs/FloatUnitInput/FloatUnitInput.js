import React from 'react'

import { mergeDefaults, pickFromDefaults, resolveFunctionValuesDeep } from '@step-wise/js-utils'

import { Translation } from 'i18n'

import { TextInput, defaultTextInputOptions } from '../TextInput'
import { defaultPrecisionNumberInputOptions } from '../PrecisionNumberInput'
import { defaultUnitInputOptions } from '../UnitInput'

import { type, initialValue, isEmpty, keyboardSettings, keyPressToFI, mouseClickToCursor, getStartCursor, getEndCursor, isCursorAtStart, isCursorAtEnd, clean, functionalize, errorToMessage } from './support'
import { FloatUnitInputInner } from './FloatUnitInputInner'
import * as validation from './validation'

export const defaultFloatUnitInputOptions = {
	...defaultPrecisionNumberInputOptions, // Loads in positive and allowPower.
	...defaultUnitInputOptions,

	contentsStyle: theme => ({
		...resolveFunctionValuesDeep(defaultPrecisionNumberInputOptions.contentsStyle, theme),
		...resolveFunctionValuesDeep(defaultUnitInputOptions.contentsStyle, theme),
		'& .spacer.unitSpacer': { width: '0.3em' },
	}),

	// Settings from outside.
	placeholder: <Translation path="inputs" entry="floatUnitInput.placeHolder">Number with unit</Translation>,
	validate: validation.nonEmptyUnit,

	// Functionalities.
	type,
	initialValue,
	isEmpty,
	keyboardSettings: keyboardSettings,
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

export function FloatUnitInput(options) {
	options = mergeDefaults(options, defaultFloatUnitInputOptions)

	// Set up options for the TextInput field.
	const { positive, allowPower } = options
	const textInputOptions = {
		...pickFromDefaults(options, defaultTextInputOptions),
		keyPressToFI: (keyInfo, FI, contentsElement) => keyPressToFI(keyInfo, FI, contentsElement, positive, allowPower),
		keyboardSettings: (FI) => keyboardSettings(FI, positive, allowPower),
	}

	// Render the TextInput.
	return <TextInput {...textInputOptions}>
		<FloatUnitInputInner />
	</TextInput>
}
FloatUnitInput.validation = validation
FloatUnitInput.translatableProps = TextInput.translatableProps
