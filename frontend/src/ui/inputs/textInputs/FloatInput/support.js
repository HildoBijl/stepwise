import { isNumber, removeAtIndex, insertAtIndex, applyMapping, keysToObject } from 'step-wise/util'

import { getClickPosition } from '../TextInput'
import { errorToMessage as integerErrorToMessage } from '../IntegerInput'

// Define various trivial objects and functions.
export const type = 'Float'
export const initialValue = {}
export const parts = ['number', 'power']
export const isEmpty = value => value.number === '' && value.power === ''
export const getStartCursor = () => ({ part: 'number', cursor: 0 })
export const getEndCursor = ({ number, power }, cursor) => (power !== '' || (cursor && cursor.part === 'power')) ? { part: 'power', cursor: power.length } : { part: 'number', cursor: number.length }
export const isCursorAtStart = (_, cursor) => cursor.part === 'number' && cursor.cursor === 0
export const isCursorAtEnd = ({ number, power }, cursor) => (cursor.part === 'power') ? (cursor.cursor === power.length) : (power === '' && cursor.cursor === number.length)
export const isValid = ({ number }) => number.replace(/[.-]/g, '').length > 0 // It should have a number somewhere in it.
export const clean = value => applyMapping(value, param => param || undefined) // Remove empty strings.
export const functionalize = value => keysToObject(parts, part => value[part] || '') // Add empty strings.

// FIToKeyboardSettings takes an FI object and determines what keyboard settings are appropriate.
export function FIToKeyboardSettings(FI, positive = false, allowPower = true) {
	const { value, cursor } = FI

	// Determine which keys to disable.
	let keySettings = {}
	if (cursor) {
		if (cursor.part === 'power') {
			keySettings['.'] = false
			keySettings.TenPower = false
		} else {
			if (positive)
				keySettings.Minus = false
		}
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
		float: {
			positive: !!positive,
			allowPower: !!allowPower,
		},
	}
}

// keyPressToFI takes a keyInfo event and an FI object and returns a new FI object.
export function keyPressToFI(keyInfo, FI, positive = false, allowPower = true) {
	// Let's walk through a large variety of cases and see what's up.
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = FI
	const { number, power } = value

	// Ignore ctrl/alt keys.
	if (ctrl || alt)
		return FI

	// For power, multiplication and E keys, move the cursor to the end of the power.
	if (allowPower && (key === '^' || key === 'Power' || key === '*' || key === 'Times' || key === 'e' || key === 'E' || key === 'TenPower'))
		return { ...FI, cursor: { part: 'power', cursor: power.length } }

	// For left/right-arrows, home and end, adjust the cursor.
	if (key === 'ArrowLeft') {
		if (cursor.part === 'power' && cursor.cursor === 0)
			return { ...FI, cursor: { part: 'number', cursor: number.length } } // Move to the end of the number.
		return { ...FI, cursor: { ...cursor, cursor: Math.max(cursor.cursor - 1, 0) } } // Move one position to the left.
	}
	if (key === 'ArrowRight') {
		if (allowPower && cursor.part === 'number' && cursor.cursor === number.length && value.power !== '')
			return { ...FI, cursor: { part: 'power', cursor: 0 } } // Move to the start of the power.
		return { ...FI, cursor: { ...cursor, cursor: Math.min(cursor.cursor + 1, value[cursor.part].length) } } // Move the cursor one position to the right.
	}
	if (key === 'Home')
		return { ...FI, cursor: getStartCursor(value, cursor) }
	if (key === 'End')
		return { ...FI, cursor: getEndCursor(value, cursor) }

	// For backspace/delete, delete the appropriate symbol.
	if (key === 'Backspace') {
		if (isCursorAtStart(value, cursor)) // Cursor is at the start of the number.
			return FI // Do nothing.
		if (cursor.part === 'power' && cursor.cursor === 0) // Cursor is at the start of the power.
			return { ...FI, value: { ...value, power: '' }, cursor: { part: 'number', cursor: number.length } } // Remove the power.
		return { ...FI, value: { ...value, [cursor.part]: removeAtIndex(value[cursor.part], cursor.cursor - 1) }, cursor: { ...cursor, cursor: cursor.cursor - 1 } } // Just remove the previous character.
	}
	if (key === 'Delete') {
		if (isCursorAtEnd(value, cursor)) // Cursor is at the end.
			return FI // Do nothing.
		if (cursor.part === 'number' && cursor.cursor === number.length) // Cursor is at the end of the number.
			return { ...FI, value: { ...value, power: '' } } // Remove the power.
		return { ...FI, value: { ...value, [cursor.part]: removeAtIndex(value[cursor.part], cursor.cursor) } } // Just remove the upcoming character.
	}

	// For the minus sign, flip the sign of the current part.
	if ((key === '-' || key === 'Minus') && (!positive || cursor.part === 'power')) {
		if (value[cursor.part].slice(0, 1) === '-')
			return { ...FI, value: { ...value, [cursor.part]: value[cursor.part].slice(1) }, cursor: { ...cursor, cursor: Math.max(cursor.cursor - 1, 0) } } // Remove a minus sign.
		return { ...FI, value: { ...value, [cursor.part]: `-${value[cursor.part]}` }, cursor: { ...cursor, cursor: cursor.cursor + 1 } } // Add a minus sign.
	}

	// Check for additions.
	if (isNumber(key)) // Numbers.
		return addStrToFI(key, FI)

	if (key === '.' || key === ',') { // Period.
		// Don't do anything if we're not in the number part.
		if (cursor.part !== 'number')
			return FI // We're not in the number.

		// If there already is a period, remove it first.
		const periodPosition = number.indexOf('.')
		if (periodPosition !== -1)
			FI = { ...FI, value: { ...value, number: removeAtIndex(number, periodPosition) }, cursor: { ...cursor, cursor: cursor.cursor + (periodPosition < cursor.cursor ? -1 : 0) } }

		// Add the period.
		return addStrToFI('.', FI)
	}

	// Check for additions. Only numbers allowed here.
	if (isNumber(key)) // Numbers.
		return { ...FI, value: insertAtIndex(value, cursor, key), cursor: cursor + 1 }

	// Unknown key. Ignore, do nothing.
	return FI
}

// addStrToFI adds a string into the FI object, at the position of the cursor. It returns the new FI object, with the cursor moved accordingly.
function addStrToFI(str, FI) {
	// Add the string at the position of the cursor or, if we are to the left of a minus sign, to the right of this minus sign instead.
	const { value, cursor } = FI
	const addAt = (cursor.cursor === 0 && value[cursor.part].slice(0, 1) === '-' ? 1 : cursor.cursor)
	return { ...FI, value: { ...value, [cursor.part]: insertAtIndex(value[cursor.part], addAt, str) }, cursor: { ...cursor, cursor: addAt + str.toString().length } }
}

// mouseClickToCursor takes an event object like a "click" (but possibly also a drag) and, for the given field, returns the cursor object related to the click.
export function mouseClickToCursor(event, FI, contentsElement) {
	// Did we click on the number element?
	const numberElement = contentsElement.getElementsByClassName('number')[0]
	if (numberElement && numberElement.contains(event.target))
		return { part: 'number', cursor: getClickPosition(event, numberElement) }

	// Was it the power element?
	const powerElement = contentsElement.getElementsByClassName('power')[0]
	if (powerElement && powerElement.contains(event.target))
		return { part: 'power', cursor: getClickPosition(event, powerElement) }

	// Was it the times symbol?
	const timesElement = contentsElement.getElementsByClassName('times')[0]
	if (timesElement && timesElement.contains(event.target))
		return { part: 'number', cursor: FI.value.number.length }

	// Was it the ten symbol?
	const tenElement = contentsElement.getElementsByClassName('ten')[0]
	if (tenElement && tenElement.contains(event.target))
		return { part: 'power', cursor: 0 }

	// Most likely we never get here. Just in case, keep the cursor as it.
	return FI.cursor
}

// errorToMessage turns an error during interpretation into a message to be displayed.
export function errorToMessage(error) {
	switch (error.code) {
		case 'DecimalSeparator': return <>Alleen een komma is geen getal.</>
		default: return integerErrorToMessage(error)
	}
}
