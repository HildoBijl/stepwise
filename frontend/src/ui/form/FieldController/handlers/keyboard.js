import { useState, useRef, useCallback } from 'react'

import { ensureConsistency } from 'step-wise/util/objects'

// useKeyboardHandlers provides handlers to the parent component (the FieldController) that lets this parent control the keyboard.
export function useKeyboardHandlers(fieldTrackerRef, tabOrderRef, tabIndexRef) {
	// Use a state to store the keyboard settings and a ref to track the keyboard ref object (a specific API).
	const [keyboardSettings, setKeyboardSettings] = useState(undefined)
	const keyboardRef = useRef()

	// getKeyboard returns the keyboard of the currently active input field.
	const getKeyboard = useCallback(() => {
		const tabIndex = tabIndexRef.current
		const activeFieldId = tabOrderRef.current[tabIndex]
		const activeField = fieldTrackerRef.current[activeFieldId]
		return activeField && activeField.keyboard
	}, [tabIndexRef, tabOrderRef, fieldTrackerRef])

	// refreshKeyboard compares the keyboard of the currently active input field with the keyboard in the state. On a difference, the state is updated.
	const refreshKeyboard = useCallback(() => {
		const desiredKeyboard = getKeyboard()
		setKeyboardSettings(keyboardSettings => desiredKeyboard && ensureConsistency(desiredKeyboard.settings, keyboardSettings))
	}, [getKeyboard])

	// storeKeyboard will store the given keyboard for the input field with the given ID.
	const storeKeyboard = useCallback((id, keyboard) => {
		// Check the input.
		if (!fieldTrackerRef.current[id])
			throw new Error(`Keyboard storing error: tried to store the keyboard of an input field "${id}" that is not registered yet.`)
		if (keyboard) {
			if (!keyboard.settings)
				throw new Error(`Invalid keyboard error: tried to store the keyboard of an input field "${id}" but no keyboard settings were present.`)
			if (!keyboard.keyFunction)
				throw new Error(`Invalid keyboard error: tried to store the keyboard of an input field "${id}" but no key function was present.`)
		}

		// Store the keyboard.
		fieldTrackerRef.current[id].keyboard = keyboard
		refreshKeyboard()
	}, [fieldTrackerRef, refreshKeyboard])

	// keyFunction is a stable function (its reference doesn't change) that calls the key function of the currently active input field.
	const keyFunction = useCallback((keyInfo, evt) => {
		const keyboard = getKeyboard()
		if (keyboard)
			return keyboard.keyFunction(keyInfo, evt)
	}, [getKeyboard])

	// All done. Return the handlers.
	return { keyboardRef, keyboardSettings, getKeyboard, keyFunction, refreshKeyboard, storeKeyboard }
}
