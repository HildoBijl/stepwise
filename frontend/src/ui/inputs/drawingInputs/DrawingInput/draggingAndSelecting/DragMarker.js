import React, { forwardRef } from 'react'
import { useTheme } from '@mui/material'

import { Square as SvgSquare } from 'ui/figures'

import { useDrawingInputData } from '../context'
import { markerSquareSide } from '../snapping'

export const DragMarker = forwardRef((_, ref) => {
	const theme = useTheme()
	const { isDragging, mouseDownData } = useDrawingInputData()

	// If no rectangle has been given, we are obviously not selecting. Don't display anything.
	if (!isDragging)
		return null

	// Render the marker.
	const { snappedPosition } = mouseDownData
	return <SvgSquare ref={ref} center={snappedPosition} graphicalSide={markerSquareSide} style={{ fill: 'none', stroke: theme.palette.secondary.dark, strokeWidth: 2 }} />
})
