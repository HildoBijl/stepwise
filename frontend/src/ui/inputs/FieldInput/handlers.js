import { useCallback, useEffect } from 'react'

import { boundTo } from 'step-wise/util'

import { useEventListener } from 'util/react'
import { getCoordinatesOf } from 'util/dom'

import { useCursorRef } from 'ui/form'
import { useSubmitAction } from 'ui/edu/exercises/util/actions'

import { addCursor, submitOnEnter } from './support'

import { useInput, useActive } from '../Input'

// useFieldInputHandlers is a single hook that calls various other hooks to arrange functionalities (key processing, mouse click processing, etcetera) for the Input Field.
export function useFieldInputHandlers(options, hullRef) {
	const { keyPressToFI, mouseClickToCursor, mouseClickToFI, getStartCursor, getEndCursor, center } = options

	// Extract data from the Input field.
	const [, setFI] = useInput()
	const active = useActive()

	// Set up a key press listener.
	const processKeyPress = useCallback(keyInfo => setFI(FI => keyPressToFI(keyInfo, FI, hullRef.current?.contents)), [setFI, keyPressToFI, hullRef])
	useKeyProcessing(processKeyPress, active)

	// Set up a mouse click listener.
	useMouseClickProcessing(mouseClickToCursor, mouseClickToFI, setFI, hullRef, getStartCursor, getEndCursor)

	// Set up hooks for graphical processing.
	useContentSliding(hullRef, center)
}

// useKeyProcessing uses an effect to listen for key presses. It gets a key press processing function, which should have as arguments a keyInfo object, an FI object and (optionally) a contentsElement object, and should return a new FI object. This function makes sure that the given processKeyPress function is called.
export function useKeyProcessing(processKeyPress, apply = true) {
	const submit = useSubmitAction()
	const keyDownHandler = useCallback(evt => {
		// Prevent browser-back-behavior (backspace), automatic scrolling on keys (home/end and arrows), and the Firefox quick-search button (slash) as well as the Firefox auto-search-on-type functionality.
		if (!evt.key.match(/^F[0-9]$/))
			evt.preventDefault()

		// Handle the key press.
		submitOnEnter(evt, submit)
		const keyInfo = { evt, key: evt.key, shift: evt.shiftKey || false, ctrl: evt.ctrlKey || false, alt: evt.altKey || false }
		processKeyPress(keyInfo)
	}, [processKeyPress, submit])
	const listeningObject = apply ? window : [] // When not active, don't listen to keys.
	useEventListener('keydown', keyDownHandler, listeningObject)
}

// useMouseClickProcessing sets up listeners for mouse clicks and calls the processing function accordingly. The mouseClickToFI must be a function which receives an event, the input FI, a contents object and a field object, and uses that to determine the new cursor position.
function useMouseClickProcessing(mouseClickToCursor, mouseClickToFI, setFI, hullRef, getStartCursor, getEndCursor) {
	const cursorRef = useCursorRef()

	// If no mouseClickToFI function has been provided, but a mouseClickToCursor function has been provided, establish an own mouseClickToFI function.
	if (!mouseClickToFI && mouseClickToCursor) {
		mouseClickToFI = (evt, FI, contentsElement, fieldElement) => {
			const cursor = mouseClickToCursor(evt, FI, contentsElement, fieldElement)
			return cursor !== undefined ? addCursor(FI, cursor) : FI
		}
	}

	// Set up the click handler.
	const mouseClickHandler = useCallback(evt => {
		// Check various cases that are the same for all input fields.
		if (!mouseClickToFI)
			return // If no process function is present, do nothing.
		const cursorElement = cursorRef.current?.element
		if (cursorElement && cursorElement.contains(evt.target))
			return // If the cursor was clicked, keep everything as is.
		const { field, contents } = hullRef.current
		if (!field.contains(evt.target))
			return // If the target element has disappeared from the field (like a filler that's no longer present when the field becomes active) then do nothing.
		if (!contents.contains(evt.target)) {
			// If the field was clicked but not the contents, check where we're closer to.
			const clickCoords = getCoordinatesOf(evt, field)
			const contentsCoords = getCoordinatesOf(contents, field)
			const contentsWidth = contents.offsetWidth
			if (clickCoords.x <= contentsCoords.x)
				setFI(FI => addCursor(FI, getStartCursor(FI?.value, FI?.cursor))) // Left
			else if (clickCoords.x >= contentsCoords.x + contentsWidth)
				setFI(FI => addCursor(FI, getEndCursor(FI?.value, FI?.cursor))) // Right
			return
		}

		// We have a field-dependent case. Check the cursor position within the contents and apply it.
		setFI(FI => mouseClickToFI(evt, FI, contents, field))
	}, [mouseClickToFI, hullRef, cursorRef, setFI, getStartCursor, getEndCursor])

	// Listen to mouse downs on the field.
	useEventListener('mousedown', mouseClickHandler, hullRef.current?.field)
}

// useContentSlidingEffect sets up an effect for content sliding. It gets references to the contents field and the cursor (if existing). It then positions the contents field within its container (the input field) such that the cursor is appropriately visible.
function useContentSliding(hullRef, center) {
	const cursorRef = useCursorRef()

	// Set up a function that adjusts the sliding.
	const adjustContentSliding = useCallback(() => {
		// Ensure all objects are present.
		const { contents, contentsContainer: container } = hullRef.current
		if (!contents || !container)
			return

		// Calculate widths.
		const contentsWidth = contents.offsetWidth + 1 // Add one for a potential cursor.
		const containerWidth = container.offsetWidth

		// If everything fits, use no transformation.
		if (containerWidth >= contentsWidth) {
			contents.style.transform = 'translateX(0px)'
			return
		}

		// If there is no cursor inside the field, then we can't position anything. Leave the previous settings.
		const cursorElement = cursorRef.current?.element
		if (!cursorElement || !container.contains(cursorElement))
			return

		// If it doesn't fit, slide it appropriately.
		const cutOff = 0.1 // The part of the container at which the contents don't slide yet.
		const cutOffDistance = cutOff * containerWidth
		const cursorPos = getCoordinatesOf(cursorElement, contents).x
		const slidePart = boundTo((cursorPos - cutOffDistance) / (contentsWidth - 2 * cutOffDistance), 0, 1) - (center ? 0.5 : 0)
		const translation = -slidePart * (contentsWidth - containerWidth)
		contents.style.transform = `translateX(${translation}px)`
	}, [hullRef, cursorRef, center])

	// Apply the function through an effect. Use a setTimeout to ensure that the adjustments are done after the absolute cursor has properly updated its position.
	useEffect(() => {
		setTimeout(adjustContentSliding, 0)
	})
}
