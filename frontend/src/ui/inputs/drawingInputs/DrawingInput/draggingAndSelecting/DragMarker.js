import React, { forwardRef } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { Square as SvgSquare } from 'ui/figures'

import { useDrawingInputData } from '../context'
import { markerSquareSide } from '../snapping'

const useStyles = makeStyles((theme) => ({
	dragMarker: {
		fill: 'none',
		stroke: theme.palette.secondary.dark,
		strokeWidth: 2,
	},
}))

export const DragMarker = forwardRef((_, ref) => {
	const { isDragging, mouseDownData } = useDrawingInputData()
	const classes = useStyles()

	// If no rectangle has been given, we are obviously not selecting. Don't display anything.
	if (!isDragging)
		return null

	// Render the marker.
	const { snappedPosition } = mouseDownData
	return <SvgSquare ref={ref} className={clsx(classes.dragMarker, 'dragMarker')} center={snappedPosition} graphicalSide={markerSquareSide} />
})
