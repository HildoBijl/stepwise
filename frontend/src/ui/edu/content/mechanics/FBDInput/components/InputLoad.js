import React, { forwardRef, useMemo } from 'react'

import { applyToEachParameter, removeProperties } from 'step-wise/util/objects'
import { isLoad, areLoadsEqual, doesLoadTouchRectangle } from 'step-wise/edu/exercises/util/engineeringMechanics'

import { useDrawingInputData, useFeedbackResult } from 'ui/inputs'

import { removeHovering, applyHovering } from '../support'

import { loadColors, EngineeringDiagramElement } from '../../EngineeringDiagram'

export const InputLoad = forwardRef(({ load, index }, ref) => {
	// Ensure that we have received data from a load.
	if (!isLoad(load))
		throw new Error(`Invalid Load rendering: tried to render a load, but received something of type "${load.type}".`)

	// Style the load based on all available data and render it.
	const styledLoad = useStyledInputLoad(load, index)
	return <EngineeringDiagramElement ref={ref} {...styledLoad} />
})

// useStyledInputLoad takes a load with data on selection/hovering, and turns it into a load that can be rendered, adding color and style data. This is based on various parameters, including potential feedback on the loads.
export function useStyledInputLoad(load, index) {
	// Acquire data.
	const { readOnly, selectionRectangle, isDragging, isSelecting, mouseData } = useDrawingInputData()
	const feedbackResult = useFeedbackResult()
	const mouseHandlers = useMouseHandlers()

	// Only style loads.
	if (!isLoad(load))
		return load

	// Set up basic styling, based on the provided parameters.
	load = {
		...load,
		color: loadColors.input,
	}

	// Add event handlers on the loads, unless specific situations arise (like it's the drag load).
	if (index !== undefined) {
		load = {
			...load,
			...applyToEachParameter(mouseHandlers, handler => (evt) => handler(index, evt)),
		}
	}

	// Apply style based on selection and hover status.
	const inSelectionRectangle = selectionRectangle && doesLoadTouchRectangle(load, selectionRectangle)
	const hoverStatus = getHoverStatus(load.selected, load.hovering, isDragging, isSelecting, inSelectionRectangle, mouseData.keys)
	load.style = readOnly ? {} : {
		filter: `url(#selectionFilter${hoverStatus})`,
		cursor: 'pointer',
	}

	// On feedback apply the specific color.
	if (feedbackResult && feedbackResult.affectedLoads && feedbackResult.affectedLoads.some(affectedLoad => areLoadsEqual(load, affectedLoad)))
		load.color = feedbackResult.color

	// All done. Remove selection data and return the outcome.
	return removeProperties(load, ['selected', 'hovering'])
}

// useMouseHandlers will return mouse event handler functions for a given load.
function useMouseHandlers() {
	const { readOnly, setFI, activateField, cancelDrag } = useDrawingInputData()

	// Set up the handlers.
	return useMemo(() => readOnly ? {} : {
		mouseenter: (loadIndex) => setFI(FI => applyHovering(FI, loadIndex)),
		mouseleave: () => setFI(FI => removeHovering(FI)),
		mousedown: (loadIndex, evt) => {
			evt.stopPropagation() // Prevent a drag start.
			cancelDrag() // Cancel a dragging effect, to prevent that a (tiny) rectangle will be processed resulting in a deselect.
			activateField() // Activate the field if not already active.
			setFI(FI => {
				// When the shift key is selected, or when no other loads are selected, flip the selection of the chosen load.
				if (evt.shiftKey || !FI.some((load, index) => (index !== loadIndex && load.selected)))
					return FI.map((load, index) => index === loadIndex ? { ...load, selected: !load.selected } : load)

				// In other cases, make sure that only the chosen load is selected.
				return FI.map((load, index) => (load.selected === (index === loadIndex)) ? load : { ...load, selected: !load.selected })
			})
		},
	}, [readOnly, setFI, activateField, cancelDrag])
}

function getHoverStatus(selected, hovering, isDragging, isSelecting, inSelectionRectangle, keys) {
	if (isDragging)
		return 0
	if (isSelecting) {
		if (inSelectionRectangle || (selected && keys.shift))
			return 2
		return 0
	}

	if (selected)
		return hovering ? 3 : 2
	return hovering ? 1 : 0
}
