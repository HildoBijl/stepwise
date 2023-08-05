import React, { forwardRef } from 'react'

import { useDrawingInputData, DragMarker } from 'ui/inputs'

import { EngineeringDiagramElement } from '../../EngineeringDiagram'

import { getDragObjectData } from '../support'

import { useStyledInputLoad } from './InputLoad'

// The DragLoad is the load shown when dragging. It uses the data from the context to determine what needs to be displayed.
export const DragLoad = forwardRef(({ options }, ref) => {
	const { mouseDownData, mouseData } = useDrawingInputData()

	// Obtain the data related to the drag object and style it.
	const dragObjectData = getDragObjectData(mouseDownData, mouseData, options)
	const styledLoad = useStyledInputLoad(dragObjectData)

	// On special cases, render the appropriate element.
	if (!dragObjectData)
		return null
	if (dragObjectData.type === 'DragMarker')
		return <DragMarker ref={ref} />

	// Render the drag load.
	return <EngineeringDiagramElement ref={ref} {...styledLoad} />
})
