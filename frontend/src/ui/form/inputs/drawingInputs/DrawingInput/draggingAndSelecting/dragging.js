import { useBounds } from 'ui/figures'

import { useInputData } from '../../../Input'

import { shouldApplySelecting, getSelectionRectangle } from './selecting'

export function useStartEndDragHandlers({ startDrag, endDrag, startSelect, endSelect, applySelecting, isSelecting, mouseDownData, setMouseDownData, eventSnapper }) {
	// Collect data.
	const { readOnly, setFI } = useInputData()
	const bounds = useBounds()

	// Set up a handler to start dragging.
	const startDragHandler = (event) => {
		// Don't drag on read-only input fields.
		if (readOnly)
			return

		// On a second touch (second time mouse down) we cancel the dragging to prevent confusion.
		if (mouseDownData)
			return setMouseDownData(undefined)

		// Call the given callback function (if it exists) to deal with this event.
		const newMouseDownData = eventSnapper(event)
		const shouldStartSelecting = shouldApplySelecting(newMouseDownData, applySelecting, endSelect)
		const callback = shouldStartSelecting ? startSelect : startDrag
		if (callback)
			setFI(FI => callback(FI, newMouseDownData))

		// Store the mouseDownData to register that a drag is active.
		setMouseDownData(newMouseDownData)
	}

	// Set up a handler to end dragging.
	const endDragHandler = (event) => {
		// Don't drag on read-only input fields. Also don't do anything if no dragging was active to begin with. (Like when the mouse goes down outside of the field but up above the field.)
		if (readOnly || !mouseDownData)
			return

		// On a selection end, give the selection rectangle and the mouse-up-util-keys.
		const mouseUpData = eventSnapper(event)
		if (isSelecting) {
			if (endSelect) {
				const selectionRectangle = getSelectionRectangle(mouseDownData.position, mouseUpData.position, bounds)
				setFI(FI => endSelect(FI, selectionRectangle, mouseUpData.keys))
			}
		}

		// On a dragging end, give the start and end points of the dragging to the dragging handler.
		if (!isSelecting && endDrag) {
			if (endDrag)
				setFI(FI => endDrag(FI, mouseDownData, mouseUpData))
		}

		// Clear the mouseDownData from the memory to end the dragging internally.
		setMouseDownData(undefined)
	}

	return { startDragHandler, endDragHandler }
}
