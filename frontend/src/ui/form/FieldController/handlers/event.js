import { useStableCallback, useEventListener, ensureHTMLElement } from 'util/react'

// The event handlers will deal with events like key presses, mouse presses and such.
export function useEventHandlers(fieldTrackerRef, keyboardRef, tabbingOnRef, { activate, blur, incrementTabIndex, decrementTabIndex, getActiveFieldId }) {
	// Set up listeners for keyboard events.
	const keyDownHandler = useStableCallback((evt) => handleKeyPress(evt, tabbingOnRef.current, incrementTabIndex, decrementTabIndex), [tabbingOnRef, incrementTabIndex, decrementTabIndex])
	useEventListener('keydown', keyDownHandler)

	// Set up listeners for mouse events.
	const mouseDownHandler = useStableCallback((evt) => handleMouseDown(evt, fieldTrackerRef, keyboardRef, getActiveFieldId, activate, blur), [fieldTrackerRef, keyboardRef, getActiveFieldId, activate, blur])
	useEventListener('mousedown', mouseDownHandler)
}

// handleKeyPress process a key press. It checks if it was a tab, and if so increments/decrements the tab index.
export function handleKeyPress(evt, tabbingOn, incrementTabIndex, decrementTabIndex) {
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
export function handleMouseDown(evt, fieldTracker, keyboardRef, getActiveFieldId, activate, blur) {
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
