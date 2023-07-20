import { Rectangle } from 'step-wise/geometry'

import { useInputData } from '../../../Input'

export const applySelectingOptions = {
	never: 0, // Never start a selection rectangle never use dragging; always use dragging.
	noSnap: 1, // On a snap use dragging; on no snap use a selection rectangle.
	noDoubleSnap: 2, // Mostly use a selection rectangle; only use dragging on a double snap.
	always: 3, // Always start a selection rectangle on a drag; never use dragging.
}

// useSelectionKeyHandler gives a handling function that receives an event and apply selection/deselection according to what the event was.
export function useSelectionKeyDownHandler(selectAll, deselectAll) {
	// Get data from parent components.
	const { readOnly, active, setFI } = useInputData()

	// Set up and return the handler.
	return (event) => {
		// Do nothing if the field is not accessible and active.
		if (readOnly || !active)
			return

		// On ctrl+a select all.
		if (selectAll && event.key === 'a' && event.ctrlKey) {
			event.preventDefault()
			return setFI(FI => selectAll(FI))
		}

		// On an escape or ctrl+d deselect all.
		if (deselectAll && (event.key === 'Escape' || (event.key === 'd' && event.ctrlKey))) {
			event.preventDefault()
			return setFI(FI => deselectAll(FI))
		}
	}
}

// shouldApplySelecting gets mouseDownData and an applySelecting setting. It uses this to determine if a selection rectangle should be started.
export function shouldApplySelecting(mouseDownData, applySelecting, endSelect) {
	// Don't start selecting if the mouse didn't go down.
	if (!mouseDownData)
		return false

	// If no endSelecting function has been provided, selecting will never happen.
	if (!endSelect)
		return false

	// Check the settings.
	switch (applySelecting) {
		case applySelectingOptions.never:
			return false
		case applySelectingOptions.noDoubleSnap:
			return !mouseDownData.isSnappedTwice
		case applySelectingOptions.noSnap:
			return !mouseDownData.isSnapped
		case applySelectingOptions.always:
			return true
		default:
			throw new Error(`Invalid applySelecting setting: received a setting of "${applySelecting}" for applySelecting on a DrawingInput, but this was not among the valid options.`)
	}
}

// getSelectionRectangle returns the selection rectangle based on two mouse data objects.
export function getSelectionRectangle(downPosition, upPosition, bounds) {
	return new Rectangle({
		start: bounds.applyBounds(downPosition),
		end: bounds.applyBounds(upPosition),
	})
}
