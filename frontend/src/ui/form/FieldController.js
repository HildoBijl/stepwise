import React, { useRef, useState, useCallback, useEffect, createContext, useContext } from 'react'

import { mod } from 'step-wise/util/numbers'

import { useEventListener, useRefWithValue } from 'util/react'

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

	// Set up handlers.
	const updateTabOrder = useCallback(() => {
		// If there is no controller, we cannot do anything.
		if (!controllerRef.current)
			return

		// Find the element number: the number in which each registered element appears within the tab controller.
		const tags = [...controllerRef.current.querySelectorAll('*')]
		const elementNumbers = []
		Object.keys(fieldTracker.current).forEach(id => {
			const number = tags.indexOf(fieldTracker.current[id].ref.current)
			if (number !== -1)
				elementNumbers.push({ id, number, manualIndex: fieldTracker.current[id].manualIndex })
		})

		// From the result determine the new tab order and check if the old active field is still in there.
		elementNumbers.sort((a, b) => (a.manualIndex - b.manualIndex || a.number - b.number))
		const newTabOrder = elementNumbers.map(data => data.id)
		const oldTabOrder = tabOrder.current // This will change before the state change is finished.
		setTabIndex(tabIndex => oldTabOrder[tabIndex] ? newTabOrder.indexOf(oldTabOrder[tabIndex]) : -1) // Adjust the tab index to keep the active field identical if there was an active field.
		tabOrder.current = newTabOrder
	}, [controllerRef, fieldTracker])

	const activate = useCallback((id) => {
		const index = tabOrder.current.indexOf(id)
		if (index === -1)
			return // Field isn't registered.
		setTabIndex(index)
	}, [tabOrder, setTabIndex])

	// activateFirst gets a set of ids and checks which is the first in the tabbing order. It activates that one.
	const activateFirst = useCallback((ids) => {
		const id = tabOrder.current.find(id => ids.includes(id))
		if (id)
			activate(id)
	}, [tabOrder, activate])

	const deactivate = useCallback((id) => {
		const index = tabOrder.current.indexOf(id)
		if (index === -1)
			return // Field isn't registered.
		if (index !== tabIndexRef.current)
			return // Field isn't active.
		setTabIndex(-1)
	}, [tabOrder, tabIndexRef, setTabIndex])

	const registerElement = useCallback((id, ref, manualIndex, autofocus) => {
		if (fieldTracker.current[id])
			throw new Error(`Invalid field control registerElement call: id "${id}" is already registered.`)
		fieldTracker.current[id] = { id, ref, manualIndex }
		updateTabOrder()
		if (autofocus)
			activate(id)
	}, [fieldTracker, updateTabOrder, activate])

	const unregisterElement = useCallback((id) => {
		delete fieldTracker.current[id]
		updateTabOrder()
	}, [fieldTracker, updateTabOrder])

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

	const isActive = useCallback((id) => tabOrder.current[tabIndexRef.current] === id, [tabOrder, tabIndexRef])

	const blur = useCallback(() => setTabIndex(-1), [setTabIndex])
	const focusFirst = useCallback(() => setTabIndex(0), [setTabIndex])

	// Set up listener.
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
		isActive,
		activate,
		activateFirst,
		deactivate,
		blur,
		focusFirst,
	}

	return (
		<FieldControllerContext.Provider value={data}>
			<div id="fieldController" ref={controllerRef}>
				{children}
			</div>
		</FieldControllerContext.Provider>
	)
}

// A consuming element can use `const [active, activate, deactivate] = useFieldControl({ id: 'fieldId', ref: refUsedForElement })` to join the tab control. Alternatively, when it's already registered, you can call the function without a ref (just an ID) to just gain the info/controls.
// Other options include the following. With `apply` set to false you can remove this field from tabbing. (Since conditional hooks not allowed.) With focusRefOnActive set to true you give the ref focus in HTML when this field is activated. With a manual index you can steer the tab order: manual index takes precedence over order in the page. With autofocus you automatically give focus to this field when it mounts. Make sure to only use this once, or it'll depend on the rendering order who gets the focus.
export function useFieldControl({ id, ref, apply = true, focusRefOnActive = false, manualIndex = 0, autofocus = false }) {
	const { registerElement, unregisterElement, isActive, activate, deactivate } = useFieldControllerContext()

	// Make sure the field is registered.
	useEffect(() => {
		if (ref && apply) {
			registerElement(id, ref, manualIndex, autofocus)
			return () => unregisterElement(id)
		}
	}, [id, ref, manualIndex, apply, registerElement, unregisterElement, autofocus])

	// Focus the field if requested.
	const active = apply && isActive(id)
	useEffect(() => {
		if (focusRefOnActive && active) {
			const field = ref.current
			setTimeout(() => field.focus()) // Delay the focus to ensure it happens after all blurs.
			return () => field.blur()
		}
	}, [focusRefOnActive, active, ref])

	// Set up handlers to return.
	const activateField = useCallback(() => activate(id), [id, activate])
	const deactivateField = useCallback(() => deactivate(id), [id, deactivate])
	return [active, activateField, deactivateField]
}

// A consuming element can access the context.
export function useFieldControllerContext() {
	return useContext(FieldControllerContext)
}

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