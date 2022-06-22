import React from 'react'
import clsx from 'clsx'

import { isNumber } from 'step-wise/util/numbers'
import { removeAtIndex, insertAtIndex } from 'step-wise/util/strings'
import { SItoFO } from 'step-wise/inputTypes/Integer'

import { selectRandomEmpty, selectRandomNegative } from 'util/feedbackMessages'

import FieldInput, { CharString, getClickPosition } from './support/FieldInput'

// Define various trivial objects and functions.
export const emptyData = { type: 'Integer', value: '' }
export const isEmpty = value => value === ''
export const getStartCursor = () => 0
export const getEndCursor = value => value ? value.length : 0
export const isCursorAtStart = (_, cursor) => cursor === 0
export const isCursorAtEnd = (value, cursor) => cursor === value.length
export const mouseClickToCursor = (evt, _, contentsElement) => getClickPosition(evt, contentsElement)

const defaultProps = {
	basic: true, // To get the basic character layout.
	placeholder: 'Geheel getal',
	positive: false,
	validate: nonEmpty,
	initialData: emptyData,
	isEmpty: data => isEmpty(data.value),
	JSXObject: Integer,
	keyboardSettings: dataToKeyboardSettings,
	keyPressToData,
	mouseClickToCursor,
	getStartCursor,
	getEndCursor,
	isCursorAtStart,
	isCursorAtEnd,
}

export default function IntegerInput(props) {
	// Gather all relevant data.
	const positive = props.positive !== undefined ? props.positive : defaultProps.positive
	const mergedProps = {
		...defaultProps,
		keyPressToData: (keyInfo, data) => keyPressToData(keyInfo, data, positive),
		keyboardSettings: (data) => dataToKeyboardSettings(data, positive),
		...props,
		className: clsx(props.className, 'integerInput'),
	}

	return <FieldInput {...mergedProps} />
}

// These are validation functions.
export function nonEmpty(data) {
	// If it's empty note it.
	if (isEmpty(data.value))
		return selectRandomEmpty()

	// If there's only a minus sign note it.
	if (data.value === '-')
		return 'Alleen een min-teken is geen getal.'
}
export function positive(data) {
	// If it's empty note it.
	const nonEmptyValidation = nonEmpty(data)
	if (nonEmptyValidation)
		return nonEmptyValidation

	// If it's negative note it.
	const integer = SItoFO(data.value)
	if (integer < 0)
		return selectRandomNegative()
}

// Integer takes an input data object and shows the corresponding contents as JSX render.
export function Integer({ type, value, cursor }) {
	if (type !== 'Integer')
		throw new Error(`Invalid type: tried to get the contents of an Integer field but got data for a type "${type}" field.`)
	return <CharString str={value} cursor={cursor} />
}

// dataToKeyboardSettings takes a data object and determines what keyboard settings are appropriate.
function dataToKeyboardSettings(data, positive = false) {
	const { value, cursor } = data

	// Determine which keys to disable.
	let keySettings = {}
	if (cursor) {
		if (isCursorAtStart(value, cursor)) {
			keySettings.Backspace = false
			keySettings.ArrowLeft = false
		}
		if (isCursorAtEnd(value, cursor))
			keySettings.ArrowRight = false
	}

	// Pass on settings.
	return {
		keySettings,
		int: {
			positive: !!positive,
		},
	}
}

// keyPressToData takes a keyInfo event and a data object and returns a new data object.
export function keyPressToData(keyInfo, data, positive) {
	// Let's walk through a large variety of cases and see what's up.
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = data

	// Ignore ctrl/alt keys.
	if (ctrl || alt)
		return data

	// For left/right-arrows, home and end, adjust the cursor.
	if (key === 'ArrowLeft')
		return { ...data, cursor: Math.max(cursor - 1, 0) }
	if (key === 'ArrowRight')
		return { ...data, cursor: Math.min(cursor + 1, value.length) }
	if (key === 'Home')
		return { ...data, cursor: getStartCursor(value, cursor) }
	if (key === 'End')
		return { ...data, cursor: getEndCursor(value, cursor) }

	// For backspace/delete, delete the appropriate symbol.
	if (key === 'Backspace') {
		if (isCursorAtStart(value, cursor))
			return data
		return { ...data, value: removeAtIndex(value, cursor - 1), cursor: cursor - 1 }
	}
	if (key === 'Delete') {
		if (isCursorAtEnd(value, cursor))
			return data
		return { ...data, value: removeAtIndex(value, cursor) }
	}

	// For the minus sign, flip the sign of the current part.
	if (!positive && (key === '-' || key === 'Minus')) {
		if (value.slice(0, 1) === '-')
			return { ...data, value: value.slice(1), cursor: Math.max(cursor - 1, 0) } // Remove a minus sign.
		return { ...data, value: `-${value}`, cursor: cursor + 1 } // Add a minus sign.
	}

	// Check for additions. Only numbers allowed here.
	if (isNumber(key)) // Numbers.
		return { ...data, value: insertAtIndex(value, cursor, key), cursor: cursor + 1 }

	// Unknown key. Ignore, do nothing.
	return data
}

