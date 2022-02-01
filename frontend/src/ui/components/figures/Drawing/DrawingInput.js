// Within a drawing, you can make use of useAsDrawingInput to get some useful tools for DrawingInputs.

import { useMemo } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import { alpha } from '@material-ui/core/styles/colorManipulator'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureArray, numberArray, filterDuplicates, sortByIndices } from 'step-wise/util/arrays'
import { Vector, Line, PositionedVector } from 'step-wise/CAS/linearAlgebra'

import { notSelectable } from 'ui/theme'

import { useMousePosition } from './Drawing'
import { Line as SvgLine, Square } from './components'

const snapMarkerSize = 6

const useStyles = makeStyles((theme) => ({
	DrawingInput: {
		'& .figureInner': {
			borderRadius: '1rem',
			cursor: 'pointer',
			...notSelectable,
			transition: `background ${theme.transitions.duration.standard}ms`,
			touchAction: 'none',
		},
		'&.active .figureInner, & .figureInner:hover': {
			background: alpha(theme.palette.primary.main, 0.05),
		},
		'& svg': {
			'& .snapLine': {
				stroke: theme.palette.primary.main,
				strokeWidth: 1,
				opacity: 0.4,
			},
			'& .snapMarker': {
				fill: 'none',
				stroke: theme.palette.primary.main,
				strokeWidth: 2,
				opacity: 0.4,
			},
		},
	},
}))

export function useAsDrawingInput(drawingRef, { snappers, snappingDistance }) {
	snappers = ensureArray(snappers)
	snappingDistance = ensureNumber(snappingDistance, true)

	// Determine styling of the object.
	const classes = useStyles()
	const className = clsx(classes.DrawingInput, 'drawingInput')

	// Track and possibly snap the mouse position.
	const drawing = drawingRef.current
	const mousePosition = useMousePosition(drawingRef)
	const snappingLines = useSnappingLines(snappers)
	const mouseInDrawing = drawing ? drawing.isInside(mousePosition) : false
	const snapResult = snapMousePosition(mouseInDrawing ? mousePosition : null, snappingLines, snappingDistance)
	const snapper = (point) => snapMousePosition(point, snappingLines, snappingDistance)

	// Return all data.
	return { className, mousePosition, mouseInDrawing, snappingLines, ...snapResult, snapper }
}

// useSnappingLines takes a snappers array and determines the snapping lines from it. It only recalculates on a change and filters duplicates.
function useSnappingLines(snappers) {
	return useMemo(() => {
		const snappingLines = []
		snappers.forEach(snapper => {
			if (snapper instanceof Line) {
				snappingLines.push(snapper)
			} else if (snapper instanceof Vector) {
				snappingLines.push(Line.getHorizontalThrough(snapper))
				snappingLines.push(Line.getVerticalThrough(snapper))
			} else if (snapper instanceof PositionedVector) {
				snappingLines.push(snapper.line)
			} else {
				throw new Error(`Invalid snapper: received a snapper with unexpected type. Make sure it is a vector, line or other allowed type.`)
			}
		})
		return filterDuplicates(snappingLines, (a, b) => a.equals(b))
	}, [snappers])
}

// snapMousePosition will calculate the position of the mouse after it's snapped to the nearest snapping line.
function snapMousePosition(mousePosition, snappingLines, snappingDistance) {
	// Check that a mouse position exists.
	if (!mousePosition)
		return { snappedMousePosition: mousePosition, snapLines: [], isMouseSnapped: false }

	// Get all the lines that fall within snapping distance.
	const squaredSnappingDistance = snappingDistance ** 2
	const snappingLineSquaredDistances = snappingLines.map(line => line.getSquaredDistanceFrom(mousePosition)) // Calculate the squared distances.
	const selectedLines = numberArray(0, snappingLines.length - 1).filter(index => snappingLineSquaredDistances[index] <= squaredSnappingDistance) // Filter out all lines that are too far, and store the indices of the selected lines.
	let snapLines = sortByIndices(selectedLines.map(index => snappingLines[index]), selectedLines.map(index => snappingLineSquaredDistances[index])) // Sort by distance.

	// Depending on how many snap lines there are, snap the mouse position accordingly.
	let snappedMousePosition = mousePosition
	if (snapLines.length > 1) { // Multiple lines. Find the intersection and check that it's close enough to the mouse point.
		const intersection = snapLines[0].getIntersection(snapLines[1])
		if (intersection.squaredDistanceTo(mousePosition) <= squaredSnappingDistance) {
			snappedMousePosition = intersection
			snapLines = snapLines.filter(line => line.containsPoint(snappedMousePosition)) // Get rid of all snapping lines that don't go through this point.
		} else {
			snapLines = snapLines.slice(0, 1) // The snap position is too far from the mouse position. Only take the closest line and use that.
		}
	}
	if (snapLines.length === 1)
		snappedMousePosition = snapLines[0].getClosestPoint(mousePosition)
	const isMouseSnapped = snapLines.length > 0

	// Return the outcome.
	return { snappedMousePosition, snapLines, isMouseSnapped }
}

// getSnapSvg takes a snapped mouse position and snap lines, and returns SVG to show the marker and the lines.
export function getSnapSvg(snappedMousePosition, snapLines, drawingRef, lineStyle = {}, markerStyle = {}) {
	const bounds = drawingRef && drawingRef.current && drawingRef.current.bounds
	return {
		marker: snapLines.length > 0 ? <Square center={snappedMousePosition} side={snapMarkerSize} className="snapMarker" style={markerStyle} /> : null,
		lines: bounds ? snapLines.map((line, index) => {
			const linePart = bounds.getLinePartWithin(line)
			return <SvgLine key={index} className="snapLine" points={[linePart.start, linePart.end]} style={lineStyle} />
		}) : [],
	}
}