import { isNumber, removeAtIndex, insertAtIndex } from 'step-wise/util'

import { selectRandomEmpty } from 'ui/eduTools'

import { getClickPosition } from '../TextInput'

// Define various trivial objects and functions.
export const type = 'Integer'
export const initialValue = ''
export const isEmpty = value => value === ''
export const getStartCursor = () => 0
export const getEndCursor = value => value ? value.length : 0
export const isCursorAtStart = (_, cursor) => cursor === 0
export const isCursorAtEnd = (value, cursor) => cursor === value.length
export const mouseClickToCursor = (evt, _, contentsElement) => getClickPosition(evt, contentsElement)

// keyboardSettings takes an FI object and determines what keyboard settings are appropriate.
export function keyboardSettings(FI, positive = false) {
	const { value, cursor } = FI

	// Determine which keys to disable.
	let keySettings = {}
	if (cursor !== undefined) {
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

// keyPressToFI takes a keyInfo event and an FI object and returns a new FI object.
export function keyPressToFI(keyInfo, FI, contentsElement, positive) {
	// Let's walk through a large variety of cases and see what's up.
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = FI

	// Ignore ctrl/alt keys.
	if (ctrl || alt)
		return FI

	// For left/right-arrows, home and end, adjust the cursor.
	if (key === 'ArrowLeft')
		return { ...FI, cursor: Math.max(cursor - 1, 0) }
	if (key === 'ArrowRight')
		return { ...FI, cursor: Math.min(cursor + 1, value.length) }
	if (key === 'Home')
		return { ...FI, cursor: getStartCursor(value, cursor) }
	if (key === 'End')
		return { ...FI, cursor: getEndCursor(value, cursor) }

	// For backspace/delete, delete the appropriate symbol.
	if (key === 'Backspace') {
		if (isCursorAtStart(value, cursor))
			return FI
		return { ...FI, value: removeAtIndex(value, cursor - 1), cursor: cursor - 1 }
	}
	if (key === 'Delete') {
		if (isCursorAtEnd(value, cursor))
			return FI
		return { ...FI, value: removeAtIndex(value, cursor) }
	}

	// For the minus sign, flip the sign of the current part.
	if (!positive && (key === '-' || key === 'Minus')) {
		if (value.slice(0, 1) === '-')
			return { ...FI, value: value.slice(1), cursor: Math.max(cursor - 1, 0) } // Remove a minus sign.
		return { ...FI, value: `-${value}`, cursor: cursor + 1 } // Add a minus sign.
	}

	// Check for additions. Only numbers allowed here.
	if (isNumber(key)) // Numbers.
		return { ...FI, value: insertAtIndex(value, cursor, key), cursor: cursor + 1 }

	// Unknown key. Ignore, do nothing.
	return FI
}

// errorToMessage turns an error-during-interpretation into a message-to-be-displayed.
export function errorToMessage(error) {
	switch (error.code) {
		case 'Empty': return selectRandomEmpty()
		case 'MinusSign': return <>Alleen een min-teken is geen getal.</>
		default: return
	}
}
