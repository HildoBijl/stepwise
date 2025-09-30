import { useRef, useLayoutEffect, useCallback } from 'react'

import { useResizeListener } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests due to Jest using the Node util package instead.

// useKeyboardPositioning manages the raising and lowering of the keyboard, setting its vertical position.
export function useKeyboardPositioning(tab, barRef, tabsRef, keyboardRef, fillerRef, active, open) {
	// Set up a handler that positions the keyboard appropriately.
	const positioningTimeoutRef = useRef()
	const positionKeyboardCB = useCallback(() => {
		setTimeout(() => positionKeyboard(positioningTimeoutRef, barRef, tabsRef, keyboardRef, fillerRef, active, open))
	}, [positioningTimeoutRef, barRef, tabsRef, keyboardRef, fillerRef, active, open]) // Use a time-out to ensure this happens after all resizing, rendering and media queries are finished.

	// Call the positioning handler upon a change in tab, or when the app resizes (like on a screen resize).
	useLayoutEffect(positionKeyboardCB, [positionKeyboardCB, tab]) // Also update the position when the active tab changes.
	useResizeListener(positionKeyboardCB)
}

// positionKeyboard takes references to various parts of the keyboard, and uses this to position the keyboard appropriately.
function positionKeyboard(positioningTimeoutRef, barRef, tabsRef, keyboardRef, fillerRef, active, open) {
	// If they keyboard has been unmounted, do nothing.
	if (!tabsRef.current || !keyboardRef.current)
		return

	// If there is still a timeout pending to position the keyboard, get rid of it.
	clearTimeout(positioningTimeoutRef.current)

	// Get keyboard heights.
	const tabHeight = tabsRef.current.offsetHeight
	const keyboardHeight = keyboardRef.current.offsetHeight

	// Check if the keyboard finished rendering. If not (and the height is still small) we should wait for a bit.
	const threshold = 40
	if (active && keyboardHeight < threshold) {
		const waitTime = 10 // Milliseconds
		positioningTimeoutRef.current = setTimeout(() => positionKeyboard(positioningTimeoutRef, barRef, tabsRef, keyboardRef, fillerRef, active, open), waitTime)
		return
	}

	// Position the keyboard appropriately.
	if (active) {
		barRef.current.style.bottom = 0
		if (open) {
			barRef.current.style.height = `${keyboardHeight}px`
			fillerRef.current.style.height = `${keyboardHeight + tabHeight}px`
		} else {
			barRef.current.style.height = 0
			fillerRef.current.style.height = `${tabHeight}px`
		}
	} else {
		barRef.current.style.bottom = `${-tabHeight}px`
		barRef.current.style.height = 0
		fillerRef.current.style.height = 0
	}
}
