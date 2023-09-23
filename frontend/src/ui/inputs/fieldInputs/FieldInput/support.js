import { isObject, removeProperties } from 'step-wise/util'

import { useInputData } from '../../Input'

// addCursor will add the given cursor to the given FI object.
export function addCursor(FI, cursor) {
	return {
		...FI,
		cursor,
	}
}

// removeCursor takes an input object like { type: "Integer", value: "123", cursor: 3 } and removes the cursor property. It returns a shallow copy.
export function removeCursor(input) {
	// If we have an array, then there is no cursor.
	if (Array.isArray(input) || !isObject(input))
		return input

	// If there is an object, check if there is a cursor.
	if (input.cursor === undefined)
		return input

	// There is a cursor. Remove it.
	return removeProperties(input, 'cursor')
}

// submitOnEnter checks if an event is an enter key press. If so, it submits the exercise using the given submit function.
export function submitOnEnter(event, submit) {
	if (event.key === 'Enter')
		submit()
}

// useCursorRef returns a ref connected to the FieldInput that will track the cursor.
export function useCursorRef() {
	return useInputData().cursorRef
}
