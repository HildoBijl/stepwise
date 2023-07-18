// Within a drawing, you can make use of useAsDrawingInput to get some useful tools for DrawingInputs.

import React from 'react'

import { processOptions, filterOptions } from 'step-wise/util/objects'

import { useDrawingData, useMouseData } from 'ui/figures'
import { useInputData } from '../../../Input'

import { DrawingInputContext } from '../context'
import { defaultSnappingOptions, useMouseSnapping, SnapLines, SnapMarker } from '../snapping'
import { defaultDraggingAndSelectingOptions, useDraggingAndSelecting, SelectionRectangle } from '../draggingAndSelecting'
import { defaultDeletingOptions, useDeleting, DeleteButton } from '../deleting'

export const defaultDrawingInputCoreOptions = {
	children: null,
	...defaultSnappingOptions,
	...defaultDraggingAndSelectingOptions,
	...defaultDeletingOptions,
}

export default function DrawingInputCore(options) {
	options = processOptions(options, defaultDrawingInputCoreOptions)
	const { children } = options

	// Get data from the parents.
	const inputData = useInputData()
	const drawingData = useDrawingData()

	// Use handlers to set up the required functionality.
	const rawMouseData = useMouseData()
	const mouseSnapping = useMouseSnapping(filterOptions(options, defaultSnappingOptions), rawMouseData)
	const mouseDragging = useDraggingAndSelecting(filterOptions(options, defaultDraggingAndSelectingOptions), { ...rawMouseData, ...mouseSnapping })
	const deleting = useDeleting(filterOptions(options, defaultDeletingOptions))

	// Assemble all data in the context. Then render all elements.
	return (
		<DrawingInputContext.Provider value={{
			...inputData,
			...drawingData,
			...mouseSnapping,
			...mouseDragging,
			...deleting,
		}}>
			<SnapLines />
			{children}
			<SnapMarker />
			<SelectionRectangle />
			<DeleteButton />
		</DrawingInputContext.Provider>
	)
}
