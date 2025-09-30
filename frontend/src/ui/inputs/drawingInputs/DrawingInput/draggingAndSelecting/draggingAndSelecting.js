import { useState, useCallback, useEffect } from 'react'

import { processOptions } from 'step-wise/util'

import { useEventListener } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests due to Jest using the Node util package instead.

import { useBounds } from 'ui/figures'

import { useInputData } from '../../../Input'

import { useDrawing } from '../context/hooks'

import { useStartEndDragHandlers } from './dragging'
import { applySelectingOptions, useSelectionKeyDownHandler, shouldApplySelecting, getSelectionRectangle } from './selecting'

export const defaultDraggingAndSelectingOptions = {
	startDrag: undefined, // The function (FI, mouseDownData) => newFI that will be called when we start a (non-selecting) drag. (It's usually not used, but can be used like a mouse-down event.)
	endDrag: undefined, // The function (FI, mouseDownData, mouseUpData) => newFI that will be called when we end a (non-selecting) drag. It's used to process the given drag.
	snapOnDrag: true, // Are snap markers shown on dragging?
	startSelect: undefined, // The function (FI, mouseDownData) => newFI that will be called when we start a selecting drag. (It's usually not used.)
	endSelect: undefined, // The function (FI, selectionRectangle, utilKeys) => newFI that will be called when we end a selecting drag. It's used to process the selection. If this is not given, selection will not be done at all.
	applySelecting: applySelectingOptions.noSnap, // This corresponds to the applySelectingOptions settings. When should we start showing a SelectionRectangle?
	selectAll: undefined, // A function to be executed when ctrl+a is pressed.
	deselectAll: undefined, // A function to be executed when ctrl+d or escape is pressed.
}

export function useDraggingAndSelecting(options, { mouseData, eventSnapper }) {
	const { startDrag, endDrag, snapOnDrag, startSelect, endSelect, applySelecting, selectAll, deselectAll } = processOptions(options, defaultDraggingAndSelectingOptions)

	// Collect data from parent components.
	const bounds = useBounds()
	const { setFI, setCursor } = useInputData()

	// Set up a state and extract data from it.
	const [mouseDownData, setMouseDownData] = useState()
	const canStartSelecting = !mouseDownData && shouldApplySelecting(mouseData, applySelecting, endSelect)
	const isSelecting = mouseDownData && shouldApplySelecting(mouseDownData, applySelecting, endSelect)
	const selectionRectangle = isSelecting ? getSelectionRectangle(mouseDownData.position, mouseData.position, bounds) : undefined
	const isDragging = !!mouseDownData && !isSelecting

	// Listen to mouse-down and mouse-up events to start/end a drag/selection.
	const { startDragHandler, endDragHandler } = useStartEndDragHandlers({ startDrag, endDrag, startSelect, endSelect, applySelecting, isSelecting, mouseDownData, setMouseDownData, eventSnapper })
	const eventContainer = useDrawing()?.figure?.inner
	useEventListener(['mousedown', 'touchstart'], startDragHandler, eventContainer, { passive: false })
	useEventListener(['mouseup', 'touchend'], endDragHandler)

	// On a click outside of the figure, deselect all.
	const clickOutsideFigureHandler = (event) => !eventContainer.contains(event.target) && setFI(FI => deselectAll(FI))
	useEventListener(['mousedown'], clickOutsideFigureHandler)

	// Listen to key presses for selecting/deselecting.
	const keyDownHandler = useSelectionKeyDownHandler(selectAll, deselectAll)
	useEventListener('keydown', keyDownHandler)

	// Through an effect, set the cursor of the input field.
	useEffect(() => setCursor((canStartSelecting || isSelecting) ? 'crosshair' : 'pointer'), [canStartSelecting, isSelecting, setCursor])

	// Set up a cancel-drag function that can be called by external components if they have a reason to end the drag.
	const cancelDrag = useCallback(() => setMouseDownData(undefined), [setMouseDownData])

	// Return all relevant data and handlers for the consuming function to use.
	return { mouseDownData, canStartSelecting, isDragging, isSelecting, selectionRectangle, cancelDrag, snapOnDrag }
}
