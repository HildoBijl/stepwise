import { keysToObject } from 'step-wise/util/objects'
import { Vector } from 'step-wise/CAS/linearAlgebra/Vector'

// resetFocus takes a field, removes the focus and restores it. This is useful to work around the Android auto-suggest option, preventing it from taking place.
export function resetFocus(field) {
	field.blur()
	field.focus()
}

// getEventPosition takes an event and gives the coordinates (client) at which it happens. It does this by return a vector to said point. On a touch event, it extracts the first touch.
export function getEventPosition(evt) {
	const obj = (evt.touches && evt.touches[0]) || (evt.changedTouches && evt.changedTouches[0]) || evt
	if (obj.clientX === undefined || obj.clientY === undefined)
		return null
	return new Vector([obj.clientX, obj.clientY])
}

// getCoordinatesOf gives the coordinates of an element within a certain parent of it. This parent can be multiple layers up, but must at some point be an offset parent.
export function getCoordinatesOf(input, parent = null) {
	// Initialize iterating parameters.
	let x = 0, y = 0
	if (input instanceof Event) {
		x = input.clientX
		y = input.clientY
	} else {
		const rect = input.getBoundingClientRect()
		x = rect.x
		y = rect.y
	}

	// When a parent is given, calculate relative coordinates.
	if (parent) {
		const parentRect = parent.getBoundingClientRect()
		x -= parentRect.x
		y -= parentRect.y
	}

	// All done!
	return { x, y }
}

// getClickSide checks if the click (event) was closer to the left (0) or right (1) of the target element and returns the corresponding number.
export function getClickSide(evt) {
	const rect = evt.target.getBoundingClientRect()
	return (evt.clientX - rect.x + 1) * 2 >= rect.width ? 1 : 0 // Add a small offset delta to make it feel more natural.
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

// getUtilKeys gets the utility keys (shift, ctrl, alt) status from an event.
export function getUtilKeys(evt) {
	return keysToObject(['shift', 'ctrl', 'alt'], key => evt[`${key}Key`])
}