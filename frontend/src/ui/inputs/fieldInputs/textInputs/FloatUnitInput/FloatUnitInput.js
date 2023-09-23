import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { processOptions, filterOptions } from 'step-wise/util'

import { TextInput, defaultTextInputOptions } from '../TextInput'
import { style as floatStyle, defaultFloatInputOptions } from '../FloatInput'
import { style as unitStyle } from '../UnitInput'

import { type, initialValue, isEmpty, keyboardSettings, keyPressToFI, mouseClickToCursor, getStartCursor, getEndCursor, isCursorAtStart, isCursorAtEnd, clean, functionalize, errorToMessage } from './support'
import { FloatUnitInputInner } from './FloatUnitInputInner'
import * as validation from './validation'

export const defaultFloatUnitInputOptions = {
	...defaultTextInputOptions,
	...defaultFloatInputOptions, // Loads in positive and allowPower.

	// Settings from outside.
	placeholder: <>Getal met eenheid</>,
	positive: false,
	allowPower: true,
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

const style = (theme) => ({
	'& .float': {
		...floatStyle(theme),
	},
	'& .spacer.unitSpacer': {
		width: '0.3em',
	},
	'& .unit': {
		...unitStyle(theme),
	},
})
const useStyles = makeStyles((theme) => ({
	floatUnitInput: style(theme)
}))
export { style }

export function FloatUnitInput(options) {
	options = processOptions(options, defaultFloatUnitInputOptions)

	// Set up options for the TextInput field.
	const classes = useStyles()
	const { positive, allowPower } = options
	const textInputOptions = {
		...filterOptions(options, defaultTextInputOptions),
		keyPressToFI: (keyInfo, FI, contentsElement) => keyPressToFI(keyInfo, FI, contentsElement, positive, allowPower),
		keyboardSettings: (FI) => keyboardSettings(FI, positive, allowPower),
		className: clsx(options.className, classes.floatUnitInput, 'floatUnitInput'),
	}

	// Render the TextInput.
	return <TextInput {...textInputOptions}>
		<FloatUnitInputInner />
	</TextInput>
}
FloatUnitInput.validation = validation
