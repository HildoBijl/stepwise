// UnitElement represents a single unit element like "km^3", but not a combined one like "N * m" or "m / s". It is not an input field but its functionality is used by other input fields.

import React from 'react'
import clsx from 'clsx'

import { isNumber } from 'step-wise/util/numbers'
import { removeAtIndex, insertAtIndex, isLetter } from 'step-wise/util/strings'
import { getEmpty, isEmpty, process } from 'step-wise/inputTypes/Unit/UnitElement'

import { getStringJSX, getClickPosition } from './Input'

// dataToContents takes an input data object and shows the corresponding contents as JSX render.
export function dataToContents({ type, value, cursor }) {
	// Check input.
	if (type !== 'UnitElement')
		throw new Error(`Invalid type: tried to get the contents of a UnitElement field but got data for a type "${type}" field.`)

	// Check if anything should be shown.
	if (isEmpty(value) && !cursor)
		return null

	// Set up the visuals in the right way.
	const useFiller = (value.prefix === '' && value.unit === '' && (!cursor || cursor.part !== 'text'))
	return (
		<span className={clsx('unitElement', { valid: !value.invalid, invalid: value.invalid })}>
			<span className="prefix">
				{getStringJSX(value.prefix, cursor && cursor.part === 'text' && cursor.cursor <= value.prefix.length && cursor.cursor)}
			</span>
			<span className="baseUnit">
				{useFiller ?
					<span className={clsx('char', 'filler', 'filler-qm')} key='filler'>?</span> :
					getStringJSX(value.unit, cursor && cursor.part === 'text' && cursor.cursor > value.prefix.length && cursor.cursor <= value.prefix.length + value.unit.length && cursor.cursor - value.prefix.length)
				}
			</span>
			<span className="power">{getStringJSX(value.power, cursor && cursor.part === 'power' && cursor.cursor)}</span>
		</span>
	)
}

// getEmptyData returns an empty data object, ready to be filled by input.
export function getEmptyData() {
	return {
		type: 'UnitElement',
		value: getEmpty(),
		cursor: getStartCursor(),
	}
}

// cursorToKeyboardType takes a cursor object (where is the cursor) and determines which Android keyboard needs to be shown: 'number', 'text' or 'none'.
export function cursorToKeyboardType(cursor) {
	return cursor && cursor.part === 'power' ? 'number' : 'text'
}

// keyPressToData takes a keyInfo event and a data object and returns a new data object.
export function keyPressToData(keyInfo, data) {
	// Let's walk through a large variety of cases and see what's up.
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = data
	const { prefix, unit, power } = value

	// Ignore ctrl/alt keys.
	if (ctrl || alt)
		return data

	// For left/right-arrows, home and end, adjust the cursor.
	if (key === 'ArrowLeft') {
		if (cursor.part === 'power' && cursor.cursor === 0) // Cursor is at the start of the power.
			return { ...data, cursor: { part: 'text', cursor: prefix.length + unit.length } } // Move to the end of the text.
		return { ...data, cursor: { ...cursor, cursor: Math.max(cursor.cursor - 1, 0) } } // Move one position to the left.
	}
	if (key === 'ArrowRight') {
		if (cursor.part === 'text' && cursor.cursor === prefix.length + unit.length && power !== '') // Cursor is at the end of the text and there is a power.
			return { ...data, cursor: { part: 'power', cursor: 0 } } // Move to the start of said power.
		return { ...data, cursor: { ...cursor, cursor: Math.min(cursor.cursor + 1, cursor.part === 'text' ? prefix.length + unit.length : power.length) } } // Move the cursor one position to the right.
	}
	if (key === 'Home')
		return { ...data, cursor: getStartCursor(value, cursor) }
	if (key === 'End')
		return { ...data, cursor: getEndCursor(value, cursor) }

	// For backspace/delete, delete the appropriate symbol.
	if (key === 'Backspace') {
		if (isCursorAtStart(value, cursor)) // Cursor is at the start of the text.
			return data // Do nothing.
		if (cursor.part === 'power') { // Cursor is in the power.
			if (cursor.cursor === 0) // Cursor is at the start of the power.
				return { ...data, ...process({ text: removeAtIndex(prefix + unit, prefix.length + unit.length - 1), power }, { part: 'text', cursor: Math.max(prefix.length + unit.length - 1, 0) }) } // Remove the last character of the text.
			return { ...data, value: { ...value, power: removeAtIndex(power, cursor.cursor - 1) }, cursor: { ...cursor, cursor: cursor.cursor - 1 } } // Remove the previous character from the power.
		}
		return { ...data, ...process({ text: removeAtIndex(prefix + unit, cursor.cursor - 1), power }, { ...cursor, cursor: cursor.cursor - 1 }) } // Remove the previous character from the text.
	}
	if (key === 'Delete') {
		if (isCursorAtEnd(value, cursor)) // Cursor is at the end.
			return data // Do nothing.
		if (cursor.part === 'text') { // Cursor is in the text.
			if (cursor.cursor === prefix.length + unit.length) // Cursor is at the end of the text.
				return { ...data, value: { ...value, power: removeAtIndex(power, 0) }, cursor: { part: 'power', cursor: 0 } } // Remove the first character from the power.
			return { ...data, ...process({ text: removeAtIndex(prefix + unit, cursor.cursor), power }, cursor) } // Remove the upcoming character from the text.
		}
		return { ...data, value: { ...value, [cursor.part]: removeAtIndex(power, cursor.cursor) } } // Remove the upcoming character from the power.
	}

	// For a power symbol move the cursor to the start of the power.
	if (key === '^' && cursor.part === 'text') {
		return { ...data, cursor: { part: 'power', cursor: 0 } }
	}

	// For letters add them to the unit.
	if (isLetter(key)) {
		const addAt = cursor.part === 'text' ? cursor.cursor : prefix.length + unit.length
		return { ...data, ...process({ text: insertAtIndex(prefix + unit, key, addAt), power }, { part: 'text', cursor: addAt + 1 }) }
	}

	// For numbers add them to the power.
	if (isNumber(key)) {
		const addAt = cursor.part === 'power' ? cursor.cursor : 0
		return { ...data, value: { ...value, power: insertAtIndex(power, key, addAt) }, cursor: { part: 'power', cursor: addAt + 1 } }
	}

	// Nothing sensible found. Don't make any changes.
	return data
}

// mouseClickToCursor takes an event object like a "click" (but possibly also a drag) and, for the given field, returns the cursor object related to the click.
export function mouseClickToCursor(evt, data, unitElementElement) {
	const { value, cursor } = data

	// Did we click on a filler?
	const fillers = [...unitElementElement.getElementsByClassName('filler')]
	if (fillers.some(filler => filler.contains(evt.target)))
		return getStartCursor()

	// Did we click on the prefix element?
	const prefixElement = unitElementElement.getElementsByClassName('prefix')[0]
	if (prefixElement && prefixElement.contains(evt.target))
		return { part: 'text', cursor: getClickPosition(evt, prefixElement) }

	// Was it the unit element?
	const unitElement = unitElementElement.getElementsByClassName('baseUnit')[0]
	if (unitElement && unitElement.contains(evt.target))
		return { part: 'text', cursor: value.prefix.length + getClickPosition(evt, unitElement) }

	// Was it the power symbol?
	const powerElement = unitElementElement.getElementsByClassName('power')[0]
	if (powerElement && powerElement.contains(evt.target))
		return { part: 'power', cursor: getClickPosition(evt, powerElement) }

	// Most likely we never get here. Just in case, keep the cursor as it.
	return cursor
}

// getStartCursor gives the cursor position at the start.
export function getStartCursor() {
	return { part: 'text', cursor: 0 }
}

// getEndCursor gives the cursor position at the end.
export function getEndCursor(value = getEmpty(), cursor) {
	const { prefix, unit, power } = value
	if (power !== '' || (cursor && cursor.part === 'power'))
		return { part: 'power', cursor: power.length }
	return { part: 'text', cursor: prefix.length + unit.length }
}

// isCursorAtStart returns a boolean: is the cursor at the start?
export function isCursorAtStart(value, cursor) {
	if (!cursor)
		return false
	return cursor.part === 'text' && cursor.cursor === 0
}

// isCursorAtEnd returns a boolean: is the cursor at the end?
export function isCursorAtEnd(value, cursor) {
	const { prefix, unit, power } = value
	if (!cursor)
		return false
	if (cursor.part === 'power')
		return cursor.cursor === power.length
	return power === '' && cursor.cursor === prefix.length + unit.length
}