// resetFocus takes a field, removes the focus and restores it. This is useful to work around the Android auto-suggest option, preventing it from taking place.
export function resetFocus(field) {
	field.blur()
	field.focus()
}

// getCoordinatesOf gives the coordinates of an element within a certain parent of it. This parent can be multiple layers up, but must at some point be an offset parent.
export function getCoordinatesOf(input, parent = null) {
	// Initialize iterating parameters.
	let x = 0, y = 0, element = input
	if (input instanceof Event) {
		const evt = input
		x = evt.offsetX
		y = evt.offsetY
		element = evt.target
	}

	// Check if the input is fine.
	if (!element)
		throw new Error(`Invalid coordinate request: tried to find the coordinates of a null element.`)
	if (parent !== null && !parent.contains(element))
		throw new Error(`Invalid coordinate request: tried to find the coordinates of an element within another element, but the parent does not contain the child.`)

	// Iterate until we reach the given parent.
	while (element !== null && !element.offsetParent) // Find an element that knows about offsets.
		element = element.parentElement
	if (element === null)
		return { x, y } // If the element has no offset parent, then it's not mounted. This occurs during testing, so we return a zero position to work further with.
	while (element !== parent && element !== null) { // Adjust coordinates.
		x += element.offsetLeft
		y += element.offsetTop
		element = element.offsetParent
	}
	return { x, y }
}

// getClickSide checks if the click (event) was closer to the left (0) or right (1) of the target element and returns the corresponding number.
export function getClickSide(evt) {
	return (evt.offsetX + 1) * 2 >= evt.target.offsetWidth ? 1 : 0 // Add a small offset delta to make it feel more natural.
}

// ignoreBackspaceEvent will prevent browser default behavior on a backspace keypress. This prevents us from going back in the browser.
export function ignoreBackspaceEvent(evt) {
	preventDefaultOnKeys(evt, 'Backspace')
}

// ignoreHomeEndEvent will prevent browser default behavior on a home/end press which would go to the start/end of the page.
export function ignoreHomeEndEvent(evt) {
	preventDefaultOnKeys(evt, ['Home', 'End'])
}

// ignoreArrowKeyEvent will prevent browser default behavior on arrow keys, which could scroll the page.
export function ignoreArrowKeyEvent(evt) {
	preventDefaultOnKeys(evt, ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])
}

export function preventDefaultOnKeys(evt, keys) {
	keys = Array.isArray(keys) ? keys : [keys]
	if (keys.includes(evt.key))
		evt.preventDefault()
}