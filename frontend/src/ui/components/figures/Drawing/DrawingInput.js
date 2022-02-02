// Within a drawing, you can make use of useAsDrawingInput to get some useful tools for DrawingInputs.

import { useMemo } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import { alpha } from '@material-ui/core/styles/colorManipulator'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureArray, numberArray, filterDuplicates, sortByIndices } from 'step-wise/util/arrays'
import { processOptions, filterOptions } from 'step-wise/util/objects'
import { Vector, Line, PositionedVector } from 'step-wise/CAS/linearAlgebra'

import { notSelectable } from 'ui/theme'
import { useAsInput, defaultInputOptions } from 'ui/form/inputs/support/Input'

import { useMousePosition } from './Drawing'
import { Line as SvgLine, Square } from './components'

export const defaultDrawingInputOptions = {
	...defaultInputOptions,
	drawingRef: null,
	snappers: [],
	snappingDistance: 10,
}

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
			'& .dragMarker': {
				fill: 'none',
				stroke: theme.palette.text.primary,
				strokeWidth: 2,
			},
		},
	},
}))

export function useAsDrawingInput(options) {
	options = processOptions(options, defaultDrawingInputOptions)
	const drawing = options.drawingRef && options.drawingRef.current

	// Register as a regular input field.
	const inputFieldData = useAsInput(filterOptions(options, defaultInputOptions))

	// Determine styling of the object.
	const classes = useStyles()
	const className = clsx(inputFieldData.className, classes.DrawingInput, 'drawingInput')

	// Track and possibly snap the mouse position.
	let { snappers, snappingDistance } = options
	snappers = ensureArray(snappers)
	snappingDistance = ensureNumber(snappingDistance, true)
	const mouseData = useMouseSnapping(drawing, snappers, snappingDistance)

	// Return all data.
	return { ...inputFieldData, className, ...mouseData }
}

// useMouseSnapping wraps all the snapping functionalities into one hook. It takes a drawing, a set of snappers and a snapping distance and takes care of all the mouse functionalities.
function useMouseSnapping(drawing, snappers, snappingDistance) {
	// Process the current mouse position.
	const mousePosition = useMousePosition(drawing)
	const mouseInDrawing = drawing ? drawing.isInside(mousePosition) : false

	// Extract snapping lines and set up a snapper based on it.
	const snappingLines = useSnappingLines(snappers)
	const snapper = (point) => snapMousePosition(point, snappingLines, snappingDistance)
	const snapResult = snapper(mouseInDrawing ? mousePosition : null)

	// Return all data.
	return { mousePosition, mouseInDrawing, snappingLines, snapper, ...snapResult }
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
export function getSnapSvg(snappedMousePosition, snapLines, drawingRef, lineStyle = {}, markerStyle = {}, snapMarkerSize = 6) {
	const bounds = drawingRef && drawingRef.current && drawingRef.current.bounds
	return {
		marker: snapLines.length > 0 ? <Square center={snappedMousePosition} side={snapMarkerSize} className="snapMarker" style={markerStyle} /> : null,
		lines: bounds ? snapLines.map((line, index) => {
			const linePart = bounds.getLinePartWithin(line)
			return <SvgLine key={index} className="snapLine" points={[linePart.start, linePart.end]} style={lineStyle} />
		}) : [],
	}
}

// addSnapSvg takes SVG elements and adds snap lines to it.
export function addSnapSvg(svgContents, snappedMousePosition, snapLines, drawingRef) {
	// If the drawing is not there yet, don't add lines.
	if (!drawingRef || !drawingRef.current)
		return svgContents

	// Get the lines and marker and display them in the right order.
	const snapSvg = getSnapSvg(snappedMousePosition, snapLines, drawingRef)
	return <>
		{snapSvg.lines}
		{svgContents}
		{snapSvg.marker}
	</>
}