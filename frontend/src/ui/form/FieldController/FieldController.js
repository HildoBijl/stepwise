import React, { useRef, useState, useCallback } from 'react'

import { useLatest } from 'util/react'

import Keyboard from '../Keyboard'
import useKeyboardHandlers from '../Keyboard/handlers'

import { FieldControllerContext } from './context'
import { useControlHandlers, useRegistrationHandlers, useEventHandlers } from './handlers'

export default function FieldController({ children }) {
	// Define refs to track all relevant data.
	const controllerRef = useRef() // Will refer to the tab controller container.
	const fieldTrackerRef = useRef({}) // Will register all tabable fields.
	const tabOrderRef = useRef([]) // Will track the order of the tabable fields.

	// Track the current active element through a tab index.
	const [tabIndex, setTabIndex] = useState(-1) // -1 means no tab has been performed just yet.
	const tabIndexRef = useLatest(tabIndex)

	// Allow to activate/deactive the tab controller.
	const [tabbingOn, setTabbingOn] = useState(true)
	const turnTabbingOn = useCallback(() => setTabbingOn(true), [setTabbingOn])
	const turnTabbingOff = useCallback(() => setTabbingOn(false), [setTabbingOn])
	const tabbingOnRef = useLatest(tabbingOn)

	// Set up keyboard state and handlers.
	const { keyboardSettings, keyFunction, storeKeyboard } = useKeyboardHandlers(fieldTrackerRef, tabOrderRef, tabIndexRef)
	const keyboardRef = useRef()

	// Define handler functions.
	const { activate, deactivate, blur, activateFirst, incrementTabIndex, decrementTabIndex, getActiveFieldId, isActive } = useControlHandlers(tabOrderRef, tabIndexRef, setTabIndex)
	const { registerElement, unregisterElement } = useRegistrationHandlers(controllerRef, fieldTrackerRef, tabOrderRef, setTabIndex, { activate })

	// Set up event listening/handling.
	useEventHandlers(fieldTrackerRef, keyboardRef, tabbingOnRef, { activate, blur, incrementTabIndex, decrementTabIndex, getActiveFieldId })

	// Gather context data.
	const data = {
		tabbingOn,
		turnTabbingOn,
		turnTabbingOff,

		registerElement,
		unregisterElement,

		tabIndex,
		incrementTabIndex,
		decrementTabIndex,

		activate,
		activateFirst,
		deactivate,
		blur,

		getActiveFieldId,
		isActive,

		keyboardSettings, // The currently active keyboard settings.
		keyboardRef, // A reference to the keyboard object, for further functionalities.
		storeKeyboard, // Used to store a keyboard for a given input field.
	}

	return (
		<FieldControllerContext.Provider value={data}>
			<div id="fieldController" ref={controllerRef}>
				{children}
			</div>
			<Keyboard ref={keyboardRef} settings={keyboardSettings} keyFunction={keyFunction} />
		</FieldControllerContext.Provider>
	)
}
