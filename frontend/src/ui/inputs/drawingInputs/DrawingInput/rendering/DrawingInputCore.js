import React from 'react'

import { mergeDefaults, pickFromDefaults } from '@step-wise/utils'

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

export function DrawingInputCore(options) {
	const { children } = options = mergeDefaults(options, defaultDrawingInputCoreOptions)

	// Get data from the parents.
	const inputData = useInputData()
	const drawingData = useDrawingData()

	// Use handlers to set up the required functionality.
	const rawMouseData = useMouseData()
	const mouseSnapping = useMouseSnapping(pickFromDefaults(options, defaultSnappingOptions), rawMouseData)
	const mouseDragging = useDraggingAndSelecting(pickFromDefaults(options, defaultDraggingAndSelectingOptions), { ...rawMouseData, ...mouseSnapping })
	const deleting = useDeleting(pickFromDefaults(options, defaultDeletingOptions))

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
