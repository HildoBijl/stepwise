/* The handlers of the keyboard are used by the parent component. Of particular importance are:
 * - keyFunction(key, evt): this function will check which input field is currently active and call the keyFunction specified for that input field.
 * - storeKeyboard(id, keyboard): for the input field with the given ID, it stores the given keyboard object. The keyboard object is an object of the form:
 *   {
 *     settings: { 
 *       int: { ... an object with settings for the int tab ... },
 *       abc: true, // true simply indicates to show this tab with the default settings.
 *       tab: 'abc', // The tab (optional) determines which tab to show prior to any user interaction.
 *     },
 *     keyFunction: (key, evt) => { ... some function provided by the input field ... },
 *   }
*/

import { useState, useCallback } from 'react'

import { deepEquals } from 'step-wise/util/objects'

import { useRefWithValue } from 'util/react'

export default function useKeyboardHandlers(fieldTracker, tabOrder, tabIndexRef) {
	// Use a state to store the keyboard settings.
	const [keyboardSettings, setKeyboardSettings] = useState(undefined)
	const keyboardSettingsRef = useRefWithValue(keyboardSettings)

	// getKeyboard returns the keyboard of the currently active input field.
	const getKeyboard = useCallback(() => {
		const tabIndex = tabIndexRef.current
		const activeFieldId = tabOrder.current[tabIndex]
		const activeField = fieldTracker.current[activeFieldId]
		return activeField && activeField.keyboard
	}, [tabIndexRef, tabOrder, fieldTracker])

	// refreshKeyboard compares the keyboard of the currently active input field with the keyboard in the state. On a difference, the state is updated.
	const refreshKeyboard = useCallback(() => {
		const currentKeyboardSettings = keyboardSettingsRef.current
		const desiredKeyboard = getKeyboard()
		if (!desiredKeyboard)
			return setKeyboardSettings(undefined)
		if (currentKeyboardSettings !== desiredKeyboard.settings && !deepEquals(currentKeyboardSettings, desiredKeyboard.settings))
			return setKeyboardSettings(desiredKeyboard.settings)
	}, [keyboardSettingsRef, getKeyboard])

	// storeKeyboard will store the given keyboard for the input field with the given ID.
	const storeKeyboard = useCallback((id, keyboard) => {
		// Check the input.
		if (!fieldTracker.current[id])
			throw new Error(`Keyboard storing error: tried to store the keyboard of an input field "${id}" that is not registered yet.`)
		if (keyboard) {
			if (!keyboard.settings)
				throw new Error(`Invalid keyboard error: tried to store the keyboard of an input field "${id}" but no keyboard settings were present.`)
			if (!keyboard.keyFunction)
				throw new Error(`Invalid keyboard error: tried to store the keyboard of an input field "${id}" but no key function was present.`)
		}

		// Store the keyboard.
		fieldTracker.current[id].keyboard = keyboard
		refreshKeyboard()
	}, [fieldTracker, refreshKeyboard])

	// keyFunction is a steady function (its reference doesn't change) that calls the key function of the currently active input field.
	const keyFunction = useCallback((keyInfo, evt) => {
		const keyboard = getKeyboard()
		if (keyboard)
			return keyboard.keyFunction(keyInfo, evt)
	}, [getKeyboard])

	return { keyboardSettings, getKeyboard, keyFunction, refreshKeyboard, storeKeyboard }
}