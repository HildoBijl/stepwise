import React, { useRef, useState, useCallback, useEffect, createContext, useContext } from 'react'

import { mod } from 'step-wise/util/numbers'
import { processOptions } from 'step-wise/util/objects'

import { useEventListener, useLatest, getHTMLElement, ensureHTMLElement } from 'util/react'
import { useVisible } from 'ui/components'

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
	const tabbingOnRef = useLatest(tabbingOn)

	// Track the current active element through a tab index.
	const [tabIndex, setTabIndex] = useState(-1) // -1 means no tab has been performed just yet.
	const tabIndexRef = useLatest(tabIndex)

	// activate will activate the field with the given ID, while deactivate deactivates it (but only when it's active, otherwise do nothing).
	const activate = useCallback((id) => {
		const index = tabOrder.current.indexOf(id)
		if (index === -1 || index === tabIndexRef.current)
			return // Field isn't registered or is already active.
		setTabIndex(index)
	}, [tabOrder, tabIndexRef, setTabIndex])
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
	const registerElement = useCallback((id, element, manualIndex, useTabbing, autofocus, focusOnClick) => {
		if (fieldTracker.current[id])
			throw new Error(`Field registration error: an input field with ID "${id}" is already registered.`)
		fieldTracker.current[id] = { id, element, manualIndex, useTabbing, focusOnClick }
		updateTabOrder()
		if (autofocus)
			activate(id)
	}, [fieldTracker, updateTabOrder, activate])
	const unregisterElement = useCallback((id) => {
		delete fieldTracker.current[id]
		updateTabOrder()
	}, [fieldTracker, updateTabOrder])

	// incrementTabIndex and decrementTabIndex adjust the tab index, shifting it one up or down.
	const incrementTabIndex = useCallback(() => {
		if (tabOrder.current.length === 0)
			return setTabIndex(-1)
		if (tabOrder.current.length === 1)
			return setTabIndex(tabIndex => (tabIndex === 0 ? -1 : 0))
		setTabIndex(mod(tabIndexRef.current + 1, tabOrder.current.length))
	}, [tabIndexRef])
	const decrementTabIndex = useCallback(() => {
		if (tabOrder.current.length === 0)
			return setTabIndex(-1)
		if (tabOrder.current.length === 1)
			return setTabIndex(tabIndex => (tabIndex === 0 ? -1 : 0))
		setTabIndex(mod(tabIndexRef.current === -1 ? -1 : tabIndexRef.current - 1, tabOrder.current.length))
	}, [tabIndexRef])

	// Set up various other trivial handlers.
	const blur = useCallback(() => setTabIndex(-1), [setTabIndex])
	const getActiveFieldId = useCallback((id) => tabOrder.current[tabIndexRef.current], [tabOrder, tabIndexRef])
	const isActive = useCallback((id) => getActiveFieldId() === id, [getActiveFieldId])

	// Set up keyboard state and handlers.
	const { keyboardSettings, keyFunction, storeKeyboard } = useKeyboardHandlers(fieldTracker, tabOrder, tabIndexRef)
	const keyboardRef = useRef()

	// Set up listeners.
	const keyDownHandler = useCallback((evt) => handleKeyPress(evt, tabbingOnRef.current, incrementTabIndex, decrementTabIndex), [tabbingOnRef, incrementTabIndex, decrementTabIndex])
	useEventListener('keydown', keyDownHandler)
	const mouseDownHandler = useCallback((evt) => handleMouseDown(evt, fieldTracker, keyboardRef, getActiveFieldId, activate, blur), [fieldTracker, keyboardRef, getActiveFieldId, activate, blur])
	useEventListener('mousedown', mouseDownHandler)

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

// useFieldRegistration allows any input field to input field to register to the FieldController. Just write `const [active, activate, deactivate] = useFieldRegistration({ id: 'fieldId', element: refUsedForElement, ... (other options) ... })`. There are the following options.
export const defaultFieldControlOptions = {
	id: undefined, // [Mandatory] A unique string related to the field.
	element: undefined, // [Mandatory] The DOM object or a React reference to one representing the field. It's use to determine tabbing order.
	apply: true, // By setting this to false, the field is unregistered. This allows you to unregister fields without needing a conditional hook.
	useTabbing: true, // Should this object be part of the tabbing order?
	manualIndex: 0, // This index is used to sort the elements for the tabbing. On a tie in the manual index the order on the page will be used.
	autofocus: false, // When true, puts the focus on this field when it mounts. Make sure to only apply this for one input field, or the last-rendered-object gets the focus, which is usually quite arbitrary.
	focusOnClick: true, // When true, whenever a click is done on the field, it is activated. Similarly, if a click is made outside of the field when it is not active, it is deactivated.
	focusRefOnActive: false, // When true, the ref DOM object is focused with obj.focus() whenever the field becomes active.
	keyboard: undefined, // A keyboard object describing all the details of what keyboard should be shown when this field is active. When undefined, no keyboard is shown. For details, see the Keyboard component and its handlers.
}
export function useFieldRegistration(options) {
	// Process input.
	const { id, element, apply, useTabbing, manualIndex, autofocus, focusOnClick, focusRefOnActive, keyboard } = processOptions(options, defaultFieldControlOptions)
	if (apply && !element)
		throw new Error(`Field registration error: no ref was given pointing to a DOM object representing the field.`)

	// Get the required handlers.
	const { registerElement, unregisterElement, storeKeyboard } = useFieldControllerContext()

	// Make sure the field is registered for tabbing.
	const visible = useVisible()
	useEffect(() => {
		if (apply && visible) {
			registerElement(id, element, manualIndex, useTabbing, autofocus, focusOnClick)
			return () => unregisterElement(id)
		}
	}, [apply, visible, id, element, manualIndex, useTabbing, autofocus, focusOnClick, registerElement, unregisterElement])

	// Focus the field if requested.
	const [active, activateField, deactivateField] = useFieldActivation(id)
	useEffect(() => {
		if (apply && visible && active) {
			if (focusRefOnActive) {
				const field = ensureHTMLElement(element)
				setTimeout(() => field.focus()) // Delay the focus to ensure it happens after all blurs.
				return () => field.blur()
			} else {
				// Make sure that no other element is still focused. If a button or so happens to be the active element, then we do not want to accidentally trigger it with an enter-like keypress.
				if (document.activeElement)
					document.activeElement.blur()
			}
		}
	}, [apply, visible, focusRefOnActive, active, element])

	// Apply the given keyboard.
	useEffect(() => {
		if (apply && visible)
			storeKeyboard(id, keyboard)
	}, [apply, visible, id, keyboard, storeKeyboard])

	// On a non-applied input field (like a read-only input field) do not allow activation. Throw an error when an attempt is made.
	const throwFunction = useCallback(() => { throw new Error(`Invalid field (de)activation: cannot (de)activate an inactive field "${id}".`) }, [id])
	if (apply && visible)
		return [active, activateField, deactivateField]
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
		const number = tags.indexOf(getHTMLElement(field.element))
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

// handleMouseClick processes a click. It checks if it clicked on an input field or not, and updates the focus accordingly.
function handleMouseDown(evt, fieldTracker, keyboardRef, getActiveFieldId, activate, blur) {
	// Ignore clicks on the keyboard.
	if (keyboardRef.current.contains(evt.target))
		return

	// If the click was on a field that should focus on a click, apply the focus.
	fieldTracker = fieldTracker.current
	const clickedFieldId = Object.keys(fieldTracker).find(id => ensureHTMLElement(fieldTracker[id].element).contains(evt.target))
	if (clickedFieldId)
		return activate(clickedFieldId)

	// If a field is active that focuses/defocuses on clicks, defocus (blur).
	const activeFieldId = getActiveFieldId()
	if (activeFieldId && fieldTracker[activeFieldId].focusOnClick)
		return blur()
}

// useKeyboardRef and useKeyboard expose the keyboard API to input fields. The useKeyboardRef is more useful for input fields that need a static reference.
export function useKeyboardRef() {
	const { keyboardRef } = useFieldControllerContext()
	return keyboardRef
}
export function useKeyboard() {
	return useKeyboardRef().current
}