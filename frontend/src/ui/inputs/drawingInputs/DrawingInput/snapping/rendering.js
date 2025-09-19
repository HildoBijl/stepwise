import React from 'react'
import { useTheme } from '@mui/material'

import { useBounds, Line as SvgLine, Square as SvgSquare } from 'ui/figures'

import { useDrawingInputData } from '../context'

export const markerSquareSide = 6 // The length of a side (in pixels) of the square snap/drag-marker.

export function SnapLines() {
	const showSnapMarking = useShowSnapMarking()
	const { mouseData } = useDrawingInputData()
	const bounds = useBounds()
	const theme = useTheme()

	// Should we actually show the snap markings? 
	if (!showSnapMarking)
		return null

	// Render the snap lines.
	const { snapLines } = mouseData
	return snapLines.map((line, index) => {
		const linePart = bounds.getLinePart(line)
		return <SvgLine key={index} points={[linePart.start, linePart.end]} style={{
			stroke: theme.palette.primary.main,
			strokeWidth: 1,
			opacity: 0.4,
		}} />
	})
}

export function SnapMarker() {
	const showSnapMarking = useShowSnapMarking()
	const { mouseData } = useDrawingInputData()
	const theme = useTheme()

	// Should we actually show the snap markings? 
	if (!showSnapMarking)
		return null

	// Render the snap marker.
	const { snappedPosition } = mouseData
	return <SvgSquare center={snappedPosition} graphicalSide={markerSquareSide} style={{
		fill: 'none',
		stroke: theme.palette.primary.main,
		strokeWidth: 2,
		opacity: 0.4,
	}} />
}

// useShowSnapMarking uses all the data from the available contexts to see if snap marking should be shown.
export function useShowSnapMarking() {
	const { applySnapping, mouseData, snapOnDrag, isSelecting, isDragging, isMouseOverButton } = useDrawingInputData()
	const bounds = useBounds()

	// If snapping is not requested, do not snap.
	if (!applySnapping)
		return false

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
