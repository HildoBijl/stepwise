import React, { useRef, useState, useCallback, useEffect, createContext, useContext } from 'react'

import { mod } from 'step-wise/util/numbers'
import { processOptions } from 'step-wise/util/objects'

import { useEventListener, useRefWithValue } from 'util/react'

import Keyboard from './Keyboard'
import useKeyboardHandlers from './Keyboard/handlers'

const FieldControllerContext = createContext()

export default function FieldController({ children }) {
	const controllerRef = useRef() // Will refer to the tab controller container.
	const fieldTracker = useRef({}) // Will register all tabable fields.
	const tabOrder = useRef([]) // Will track the order of the tabable fields.

	// Allow to activate/deactive the tab controller.
	const [tabbingOn, setTabbingOn] = useState(true)
	const turnTabbingOn = useCallback(() => setTabbingOn(true), [setTabbingOn])
	const turnTabbingOff = useCallback(() => setTabbingOn(false), [setTabbingOn])
	const tabbingOnRef = useRefWithValue(tabbingOn)

	// Track the current active element through a tab index.
	const [tabIndex, setTabIndex] = useState(-1) // -1 means no tab has been performed just yet.
	const tabIndexRef = useRefWithValue(tabIndex)

	// activate will activate the field with the given ID, while deactivate deactivates it (but only when it's active, otherwise do nothing).
	const activate = useCallback((id) => {
		const index = tabOrder.current.indexOf(id)
		if (index === -1)
			return // Field isn't registered.
		setTabIndex(index)
	}, [tabOrder, setTabIndex])
	const deactivate = useCallback((id) => {
		const index = tabOrder.current.indexOf(id)
		if (index === -1)
			return // Field isn't registered.
		if (index !== tabIndexRef.current)
			return // Field isn't active.
		setTabIndex(-1)
	}, [tabOrder, tabIndexRef, setTabIndex])

	// activateFirst focuses on the first field in the form. Optionally a set of ids can be passed. When this is done, the focus is put on the first field among the given list. (This is for instance used when a form has various faulty fields and wants to activate the first of these.)
	const activateFirst = useCallback((ids) => {
		if (!ids)
			return setTabIndex(0)
		const id = tabOrder.current.find(id => ids.includes(id))
		if (id)
			activate(id)
	}, [setTabIndex, tabOrder, activate])

	// updateTabOrder refreshes the tab order, for instance when a new field is added.
	const updateTabOrder = useCallback(() => {
		const newTabOrder = getTabOrder(controllerRef.current, fieldTracker.current)
		const oldTabOrder = tabOrder.current // This will change before the state change is finished.
		setTabIndex(tabIndex => (oldTabOrder && oldTabOrder[tabIndex] ? newTabOrder.indexOf(oldTabOrder[tabIndex]) : -1)) // Adjust the tab index to keep the active field identical if there was an active field.
		tabOrder.current = newTabOrder
	}, [controllerRef, fieldTracker, tabOrder, setTabIndex])

	// registerElement adds an input field to the tab order, and unregisterElement removes it again.
	const registerElement = useCallback((id, ref, manualIndex, useTabbing, autofocus) => {
		if (fieldTracker.current[id])
			throw new Error(`Field registration error: an input field with ID "${id}" is already registered.`)
		fieldTracker.current[id] = { id, ref, manualIndex, useTabbing }
		updateTabOrder()
		if (autofocus)
			activate(id)
	}, [fieldTracker, updateTabOrder, activate])
	const unregisterElement = useCallback((id) => {
		delete fieldTracker.current[id]
		updateTabOrder()
	}, [fieldTracker, updateTabOrder])

	// incrementTabIndex and decrementTabIndex adjust the tab index, shifting it one up or down.
	const incrementTabIndex = useCallback((id) => {
		if (tabOrder.current.length === 0)
			return setTabIndex(-1)
		if (tabOrder.current.length === 1)
			return setTabIndex(tabIndex => (tabIndex === 0 ? -1 : 0))
		setTabIndex(mod(tabIndexRef.current + 1, tabOrder.current.length))
	}, [tabIndexRef])
	const decrementTabIndex = useCallback((id) => {
		if (tabOrder.current.length === 0)
			return setTabIndex(-1)
		if (tabOrder.current.length === 1)
			return setTabIndex(tabIndex => (tabIndex === 0 ? -1 : 0))
		setTabIndex(mod(tabIndexRef.current === -1 ? -1 : tabIndexRef.current - 1, tabOrder.current.length))
	}, [tabIndexRef])

	// Set up various other trivial handlers.
	const isActive = useCallback((id) => tabOrder.current[tabIndexRef.current] === id, [tabOrder, tabIndexRef])
	const blur = useCallback(() => setTabIndex(-1), [setTabIndex])

	// Set up keyboard state and handlers.
	const { keyboardSettings, keyFunction, storeKeyboard } = useKeyboardHandlers(fieldTracker, tabOrder, tabIndexRef)
	const keyboardRef = useRef()

	// Set up listeners.
	const keyDownHandler = useCallback((evt) => handleKeyPress(evt, tabbingOnRef.current, incrementTabIndex, decrementTabIndex), [tabbingOnRef, incrementTabIndex, decrementTabIndex])
	useEventListener('keydown', keyDownHandler)

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
		blur,

		activate,
		activateFirst,
		deactivate,
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

// Any consuming element can access the context.
export function useFieldControllerContext() {
	return useContext(FieldControllerContext)
}

// useFieldActivation can take a field ID and get tools to check if the field is active and activate/deactivate it.
export function useFieldActivation(id) {
	const { isActive, activate, deactivate } = useFieldControllerContext()
	const active = isActive(id)
	const activateField = useCallback(() => activate(id), [id, activate])
	const deactivateField = useCallback(() => deactivate(id), [id, deactivate])
	return [active, activateField, deactivateField]
}

// useFieldRegistration allows any input field to input field to register to the FieldController. Just write `const [active, activate, deactivate] = useFieldRegistration({ id: 'fieldId', ref: refUsedForElement, ... (other options) ... })`. There are the following options.
const defaultFieldControlOptions = {
	id: undefined, // [Mandatory] A unique string related to the field.
	ref: undefined, // [Mandatory] A React reference to a DOM object representing the field. It's use to determine tabbing order.
	apply: true, // By setting this to false, the field is unregistered. This allows you to unregister fields without needing a conditional hook.
	useTabbing: true, // Should this object be part of the tabbing order?
	manualIndex: 0, // This index is used to sort the elements for the tabbing. On a tie in the manual index the order on the page will be used.
	autofocus: false, // When true, puts the focus on this field when it mounts. Make sure to only apply this for one input field, or the last-rendered-object gets the focus, which is usually quite arbitrary.
	focusRefOnActive: false, // When true, the ref DOM object is focused with obj.focus() whenever the field becomes active.
	keyboard: undefined, // A keyboard object describing all the details of what keyboard should be shown when this field is active. When undefined, no keyboard is shown. For details, see the Keyboard component and its handlers.
}
export function useFieldRegistration(options) {
	// Process input.
	const { id, ref, apply, useTabbing, manualIndex, autofocus, focusRefOnActive, keyboard } = processOptions(options, defaultFieldControlOptions)
	if (!id || typeof id !== 'string')
		throw new Error(`Field registration error: could not register an input field to the field controller. No valid ID is was given. The ID has type ${typeof id}.`)
	if (!ref)
		throw new Error(`Field registration error: no ref was given pointing to a DOM object representing the field.`)

	// Get the required handlers.
	const { registerElement, unregisterElement, storeKeyboard } = useFieldControllerContext()

	// Make sure the field is registered for tabbing.
	useEffect(() => {
		if (apply) {
			registerElement(id, ref, manualIndex, useTabbing, autofocus)
			return () => unregisterElement(id)
		}
	}, [apply, id, ref, manualIndex, useTabbing, autofocus, registerElement, unregisterElement])

	// Focus the field if requested.
	const [active, activateField, deactivateField] = useFieldActivation(id)
	useEffect(() => {
		if (apply && active) {
			if (focusRefOnActive) {
				const field = ref.current
				setTimeout(() => field.focus()) // Delay the focus to ensure it happens after all blurs.
				return () => field.blur()
			} else {
				// Make sure that no other element is still focused. If a button or so happens to be the active element, then we do not want to accidentally trigger it with an enter-like keypress.
				if (document.activeElement)
					document.activeElement.blur()
			}
		}
	}, [apply, focusRefOnActive, active, ref])

	// Apply the given keyboard.
	useEffect(() => {
		if (apply)
			storeKeyboard(id, keyboard)
	}, [apply, id, keyboard, storeKeyboard])

	// Return the controllers from useFieldActivation.
	if (apply)
		return [active, activateField, deactivateField]

	// On a non-applied input field (like a read-only input field) do not allow activation. Throw an error when an attempt is made.
	const throwFunction = () => { throw new Error(`Invalid field (de)activation: cannot (de)activate an inactive field "${id}".`) }
	return [false, throwFunction, throwFunction]
}

// getTabOrder takes a controller DOM object and a fields object (with all fields inside this DOM object) and returns the required tabbing order, as an array of field IDs.
function getTabOrder(controller, fields) {
	// If there is no controller initialized, we cannot do anything.
	if (!controller)
		return

	// Find the element number: the number in which each registered element appears within the tab controller.
	const tags = [...controller.querySelectorAll('*')]
	const elementNumbers = []
	Object.keys(fields).forEach(id => {
		const field = fields[id]
		if (!field.useTabbing)
			return
		const number = tags.indexOf(field.ref.current)
		if (number !== -1)
			elementNumbers.push({ id, number, manualIndex: field.manualIndex })
	})

	// From the result determine the new tab order and check if the old active field is still in there.
	elementNumbers.sort((a, b) => (a.manualIndex - b.manualIndex || a.number - b.number))
	return elementNumbers.map(data => data.id)
}

// handleKeyPress process a key press. It checks if it was a tab, and if so increments/decrements the tab index.
function handleKeyPress(evt, tabbingOn, incrementTabIndex, decrementTabIndex) {
	// In case of a tab, cycle through the fields.
	if (tabbingOn && evt.key === 'Tab') {
		evt.preventDefault() // Don't apply regular tab control.
		if (evt.shiftKey)
			decrementTabIndex()
		else
			incrementTabIndex()
	}
}

// useKeyboardRef and useKeyboard expose the keyboard API to input fields. The useKeyboardRef is more useful for input fields that need a static reference.
export function useKeyboardRef() {
	const { keyboardRef } = useFieldControllerContext()
	return keyboardRef
}
export function useKeyboard() {
	return useKeyboardRef().current
}