import React from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { useBounds, Line as SvgLine, Square as SvgSquare } from 'ui/figures'

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

export function SnapLines({ mouseSnapping }) {
	const { mouseData } = mouseSnapping
	const bounds = useBounds()
	const classes = useStyles()

	// Should we actually show the snap markings? 
	if (!shouldShowSnapMarking(mouseData, bounds))
		return null

	// Render the snap lines.
	const { snapLines } = mouseData
	return snapLines.map((line, index) => {
		const linePart = bounds.getLinePart(line)
		return <SvgLine key={index} className={clsx(classes.snapLine, 'snapLine')} points={[linePart.start, linePart.end]} />
	})
}

export function SnapMarker({ mouseSnapping }) {
	const { mouseData } = mouseSnapping
	const bounds = useBounds()
	const classes = useStyles()

	// Should we actually show the snap markings? 
	if (!shouldShowSnapMarking(mouseData, bounds))
		return null

	// Render the snap marker.
	const { snappedPosition } = mouseData
	return <SvgSquare className={clsx(classes.snapMarker, 'snapMarker')} center={snappedPosition} graphicalSide={markerSquareSide} />
}

// shouldShowSnapMarker checks, given a mouseData object, whether snapping markers should be shown.
export function shouldShowSnapMarking(mouseData, bounds) {
	// On missing data, do not show anything.
	if (!mouseData || !bounds || !mouseData.position)
		return false
	const { position, isSnapped } = mouseData

	// On an out of bounds position, do not show anything.
	if (!bounds.contains(position))
		return false

	// On no snap, do not show anything.
	if (!isSnapped)
		return false

	// All in order!
	return true
}
