import React from 'react'
import clsx from 'clsx'

import { isEmpty, IOtoFO } from 'step-wise/edu/inputTransformation/Integer'
import { isNumber } from 'step-wise/util/numbers'
import { selectRandomly } from 'step-wise/util/random'
import { removeAtIndex, insertAtIndex } from 'step-wise/util/strings'
import { getClickSide } from '../../../../util/dom'
import Input, { getStringJSX } from './Input'

function getEmptyData() {
	return { type: 'Integer', value: '', cursor: 0 }
}

const defaultProps = {
	placeholder: 'Geheel getal',
	positive: false,
	validate: nonEmpty,
	initialValue: getEmptyData(),
	isEmpty: data => isEmpty(data.value),
	dataToContents,
	cursorToKeyboardType,
	keyPressToData,
	mouseClickToCursor,
	getStartCursor,
	getEndCursor,
}

export default function IntegerInput(props) {
	// Gather all relevant data.
	const positive = props.positive !== undefined ? props.positive : defaultProps.positive
	const mergedProps = {
		...defaultProps,
		processKeyPress: (keyInfo, data) => keyPressToData(keyInfo, data, positive),
		...props,
		className: clsx(props.className, 'integerInput'),
	}

	return <Input {...mergedProps} />
}

// These are validation functions.
export function nonEmpty(data) {
	// If it's empty note it.
	if (isEmpty(data.value))
		return selectRandomly(['Geen getal ingevuld.', 'Dit veld is nog leeg.', 'Je bent hier iets vergeten in te vullen.'])
	
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
		return selectRandomly(['Dit is een negatief getal.', 'Dit getal is niet positief.', 'Dat minteken hoort daar niet.'])
}

// dataToContents takes an input data object and shows the corresponding contents as JSX render.
export function dataToContents({ type, value, cursor }) {
	if (type !== 'Integer')
		throw new Error(`Invalid type: tried to get the contents of an Integer field but got data for a type "${type}" field.`)
	return getStringJSX(value, cursor)
}

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

	// For power, multiplication and E keys, move the cursor to the end of the power.
	if (key === '^' || key === '*' || key === 'e' || key === 'E')
		return { ...data, cursor: { part: 'power', cursor: value.power.length } }

	// For left/right-arrows, home and end, adjust the cursor.
	if (key === 'ArrowLeft')
		return { ...data, cursor: Math.max(cursor - 1, 0) }
	if (key === 'ArrowRight')
		return { ...data, cursor: Math.min(cursor + 1, value.length) }
	if (key === 'Home')
		return { ...data, cursor: 0 }
	if (key === 'End')
		return { ...data, cursor: value.length }

	// For backspace/delete, delete the appropriate symbol.
	if (key === 'Backspace') {
		if (cursor === 0)
			return data
		return { ...data, value: removeAtIndex(value, cursor - 1), cursor: cursor - 1 }
	}
	if (key === 'Delete') {
		if (cursor === value.length)
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
export function mouseClickToCursor(evt, data, contentsElement, fieldElement) {
	const charPos = [...contentsElement.getElementsByClassName('char')].indexOf(evt.target)
	return charPos + getClickSide(evt)
}

// getStartCursor gives the cursor position at the start of the element.
export function getStartCursor(value) {
	return 0
}

// getEndCursor gives the cursor position at the end of the element.
export function getEndCursor(value) {
	if (!value)
		return 0
	return value.length
}