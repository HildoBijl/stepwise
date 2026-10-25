import React from 'react'

import { mergeDefaults, pickFromDefaults, resolveFunctionValuesDeep } from '@step-wise/js-utils'
import { withTranslation } from '@step-wise/i18n'

import { InputTranslation } from 'ui/inputs/InputTranslation'

import { fieldInputTranslatedProps } from '../../FieldInput'
import { TextInput, defaultTextInputOptions } from '../TextInput'
import { defaultPrecisionNumberInputOptions } from '../PrecisionNumberInput'
import { defaultUnitInputOptions } from '../UnitInput'

import { type, initialValue, isEmpty, keyboardSettings, keyPressToFI, mouseClickToCursor, getStartCursor, getEndCursor, isCursorAtStart, isCursorAtEnd, clean, functionalize, errorToMessage } from './support'
import { QuantityInputInner } from './QuantityInputInner'
import * as validation from './validation'

export const defaultQuantityInputOptions = {
	...defaultPrecisionNumberInputOptions, // Loads in positive and allowPower.
	...defaultUnitInputOptions,

	contentsStyle: theme => ({
		...resolveFunctionValuesDeep(defaultPrecisionNumberInputOptions.contentsStyle, theme),
		...resolveFunctionValuesDeep(defaultUnitInputOptions.contentsStyle, theme),
		'& .spacer.unitSpacer': { width: '0.3em' },
	}),

	// Settings from outside.
	placeholder: <InputTranslation input="quantityInput" id="placeHolder">Number with unit</InputTranslation>,
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

function QuantityInputBase(options) {
	options = mergeDefaults(options, defaultQuantityInputOptions)

	// Set up options for the TextInput field.
	const { positive, allowPower } = options
	const textInputOptions = {
		...pickFromDefaults(options, defaultTextInputOptions),
		keyPressToFI: (keyInfo, FI, contentsElement) => keyPressToFI(keyInfo, FI, contentsElement, positive, allowPower),
		keyboardSettings: (FI) => keyboardSettings(FI, positive, allowPower),
	}

	// Render the TextInput.
	return <TextInput {...textInputOptions}>
		<QuantityInputInner />
	</TextInput>
}

export const QuantityInput = Object.assign(withTranslation(QuantityInputBase, {
	tag: 'quantity-input',
	translatedProps: fieldInputTranslatedProps,
}), {
	validation,
})
