import React from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { useBounds, Line as SvgLine, Square as SvgSquare } from 'ui/figures'

import { useDrawingInputData } from '../context'

export const markerSquareSide = 6 // The length of a side (in pixels) of the square snap/drag-marker.

const useStyles = makeStyles((theme) => ({
	snapLine: {
		stroke: theme.palette.primary.main,
		strokeWidth: 1,
		opacity: 0.4,
	},
	snapMarker: {
		fill: 'none',
		stroke: theme.palette.primary.main,
		strokeWidth: 2,
		opacity: 0.4,
	},
}))

export function SnapLines() {
	const showSnapMarking = useShowSnapMarking()
	const { mouseData } = useDrawingInputData()
	const bounds = useBounds()
	const classes = useStyles()

	// Should we actually show the snap markings? 
	if (!showSnapMarking)
		return null

	// Render the snap lines.
	const { snapLines } = mouseData
	return snapLines.map((line, index) => {
		const linePart = bounds.getLinePart(line)
		return <SvgLine key={index} className={clsx(classes.snapLine, 'snapLine')} points={[linePart.start, linePart.end]} />
	})
}

export function SnapMarker() {
	const showSnapMarking = useShowSnapMarking()
	const { mouseData } = useDrawingInputData()
	const classes = useStyles()

	// Should we actually show the snap markings? 
	if (!showSnapMarking)
		return null

	// Render the snap marker.
	const { snappedPosition } = mouseData
	return <SvgSquare className={clsx(classes.snapMarker, 'snapMarker')} center={snappedPosition} graphicalSide={markerSquareSide} />
}

// useShowSnapMarking uses all the data from the available contexts to see if snap marking should be shown.
export function useShowSnapMarking() {
	const { mouseData, snapOnDrag, isSelecting, isDragging, isMouseOverButton } = useDrawingInputData()
	const bounds = useBounds()

	// On missing data, do not snap.
	if (!mouseData || !bounds || !mouseData.position)
		return false

	// On an out of bounds position, do not show anything.
	const { position, isSnapped } = mouseData
	if (!bounds.contains(position))
		return false

	// If the mouse position is not at a snapping point, there is no snap that can be done.
	if (!isSnapped)
		return false

	// If we are dragging, the setting 'snapOnDrag' determines if we should snap.
	if (isDragging)
		return snapOnDrag

	// If we are selecting, do not snap.
	if (isSelecting)
		return false

	// If the mouse is over a button, do not snap.
	if (isMouseOverButton)
		return false

	// No reason found not to snap. Let's snap.
	return true
}
