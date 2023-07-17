// Within a drawing, you can make use of useAsDrawingInput to get some useful tools for DrawingInputs.

import React from 'react'

import { processOptions, filterOptions } from 'step-wise/util/objects'

import { useMousePosition } from 'ui/figures'

import { DrawingInputContext } from '../context'
import { defaultSnappingOptions, useMouseSnapping, SnapLines, SnapMarker } from '../snapping'
import { defaultDraggingAndSelectingOptions, useDraggingAndSelecting, SelectionRectangle } from '../draggingAndSelecting'

export const defaultDrawingInputCoreOptions = {
	children: null,
	...defaultSnappingOptions,
	...defaultDraggingAndSelectingOptions,
}

export default function DrawingInputCore(options) {
	options = processOptions(options, defaultDrawingInputCoreOptions)
	const { children } = options

	// Use handlers to set up the required functionality.
	const mousePosition = useMousePosition()
	const mouseSnapping = useMouseSnapping(filterOptions(options, defaultSnappingOptions), { mousePosition })
	const mouseDragging = useDraggingAndSelecting(filterOptions(options, defaultDraggingAndSelectingOptions), { mousePosition, ...mouseSnapping })

	// ToDo: deletion






	// Render the drawing and the feedback box.
	// ToDo: make SnapMarkings also get data from Context. Seems easier. But how to deal with isOverButton?
	const { snapOnDrag } = options
	const { isSelecting, isDragging } = mouseDragging
	const isOverButton = false
	const showSnappers = (!isDragging || snapOnDrag) && !isSelecting && !isOverButton
	return (
		<DrawingInputContext.Provider value={{
			mousePosition,
			...mouseSnapping,
			...mouseDragging,
		}}>
			{showSnappers ? <SnapLines mouseSnapping={mouseSnapping} /> : null}
			{children}
			{showSnappers ? <SnapMarker mouseSnapping={mouseSnapping} /> : null}
			<SelectionRectangle />
		</DrawingInputContext.Provider>
	)
}
