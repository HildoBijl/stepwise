import React from 'react'
import clsx from 'clsx'

import { isNumber } from 'step-wise/util/numbers'
import { selectRandomEmpty, selectRandomNegative } from 'step-wise/util/random'
import { removeAtIndex, insertAtIndex } from 'step-wise/util/strings'
import { getEmpty, isEmpty, IOtoFO } from 'step-wise/inputTypes/Integer'

import Input, { getStringJSX, getClickPosition } from './Input'

const defaultProps = {
	placeholder: 'Geheel getal',
	positive: false,
	validate: nonEmpty,
	initialData: getEmptyData(),
	isEmpty: data => isEmpty(data.value),
	dataToContents,
	cursorToKeyboardType,
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
		...props,
		className: clsx(props.className, 'integerInput'),
		keyboardSettings: (data) => dataToKeyboardSettings(data, positive),
	}

	return <Input {...mergedProps} />
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
	const integer = IOtoFO(data.value)
	if (integer < 0)
		return selectRandomNegative()
}

// dataToContents takes an input data object and shows the corresponding contents as JSX render.
export function dataToContents({ type, value, cursor }) {
	if (type !== 'Integer')
		throw new Error(`Invalid type: tried to get the contents of an Integer field but got data for a type "${type}" field.`)
	return getStringJSX(value, cursor)
}

export function getEmptyData() {
	return { type: 'Integer', value: getEmpty(), cursor: 0 }
}

// dataToKeyboardSettings takes a data object and determines what keyboard settings are appropriate.
function dataToKeyboardSettings(data, positive) {
	const { value, cursor } = data
	let settings = {}
	if (positive)
		settings = { ...settings, positive: true }
	if (isCursorAtStart(value, cursor))
		settings = { ...settings, Backspace: 'disabled', ArrowLeft: 'disabled' }
	if (isCursorAtEnd(value, cursor))
		settings = { ...settings, ArrowRight: 'disabled' }
	return { int: settings }
}

// ToDo: remove.
// cursorToKeyboardType takes a cursor object (where is the cursor) and determines which Android keyboard needs to be shown: 'number', 'text' or 'none'.
export function cursorToKeyboardType(cursor) {
	return 'number'
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
	if (!positive && key === '-') {
		if (value.slice(0, 1) === '-')
			return { ...data, value: value.slice(1), cursor: Math.max(cursor - 1, 0) } // Remove a minus sign.
		return { ...data, value: `-${value}`, cursor: cursor + 1 } // Add a minus sign.
	}

	// Check for additions. Only numbers allowed here.
	if (isNumber(key)) // Numbers.
		return { ...data, value: insertAtIndex(value, key, cursor), cursor: cursor + 1 }

	// Unknown key. Ignore, do nothing.
	return data
}

// mouseClickToCursor takes an event object like a "click" (but possibly also a drag) and, for the given field, returns the cursor object related to the click.
export function mouseClickToCursor(evt, data, contentsElement) {
	return getClickPosition(evt, contentsElement)
}

// getStartCursor gives the cursor position at the start.
export function getStartCursor(value) {
	return 0
}

// getEndCursor gives the cursor position at the end.
export function getEndCursor(value) {
	if (!value)
		return 0
	return value.length
}

// isCursorAtStart returns a boolean: is the cursor at the start?
export function isCursorAtStart(value, cursor) {
	return cursor === 0
}

// isCursorAtEnd returns a boolean: is the cursor at the end?
export function isCursorAtEnd(value, cursor) {
	return cursor === value.length
}