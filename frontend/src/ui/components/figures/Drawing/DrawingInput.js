// Within a drawing, you can make use of useAsDrawingInput to get some useful tools for DrawingInputs.

import { useMemo } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureArray, numberArray, filterDuplicates, sortByIndices } from 'step-wise/util/arrays'
import { processOptions, filterOptions } from 'step-wise/util/objects'
import { Vector, Line, PositionedVector } from 'step-wise/CAS/linearAlgebra'

import { notSelectable } from 'ui/theme'
import { useAsInput, defaultInputOptions } from 'ui/form/inputs/support/Input'

import { useMousePosition, PositionedElement } from './Drawing'
import { Line as SvgLine, Square } from './components'

export const defaultDrawingInputOptions = {
	...defaultInputOptions,
	drawingRef: null,
	snappers: [],
	snappingDistance: 10,
}

// Field definitions.
const border = 0.0625 // em
const glowRadius = 0.25 // em

const useStyles = makeStyles((theme) => ({
	DrawingInput: {
		// Positioning of the drawing and the feedback text.
		alignItems: 'stretch',
		display: 'flex',
		flex: '1 1 100%',
		flexFlow: 'column nowrap',
		margin: '1.2rem auto',
		minWidth: 0, // A fix to not let flexboxes grow beyond their maximum width.
		maxWidth: ({ maxWidth }) => maxWidth !== undefined ? `${maxWidth}px` : '',

		'& .drawing': {
			'& .figure': {
				margin: '0',
			},

			// Drawing input style.
			'& .figureInner': {
				background: theme.palette.inputBackground.main,
				border: ({ feedbackColor }) => `${border}em solid ${feedbackColor || theme.palette.text.secondary}`,
				borderRadius: '0.5rem',
				boxShadow: ({ active, feedbackColor }) => active ? `0 0 ${glowRadius}em 0 ${feedbackColor || theme.palette.text.secondary}` : 'none',
				cursor: 'pointer',
				...notSelectable,
				transition: `border ${theme.transitions.duration.standard}ms`,
				touchAction: 'none',

				'&:hover': {
					boxShadow: ({ readOnly, feedbackColor }) => readOnly ? 'none' : `0 0 ${glowRadius}em 0 ${feedbackColor || theme.palette.text.secondary}`,
				},

				'& .icon': {
					color: ({ feedbackColor }) => feedbackColor || theme.palette.text.primary,
				},
			},

			// Snapping system style.
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

		'& .feedbackText': {
			color: ({ feedbackColor }) => feedbackColor || theme.palette.text.primary,
			display: ({ hasFeedbackText }) => hasFeedbackText ? 'block' : 'none',
			fontSize: '0.75em',
			letterSpacing: '0.03em',
			lineHeight: 1.2,
			padding: '0.3em 2.4em 0',
			transition: `color ${theme.transitions.duration.standard}ms`,
		},
	},
}))

// The DrawingInput wrapper needs to be used to add the right classes and to properly position potential feedback.
export function DrawingInput({ inputData, options = {}, children, className }) {
	// Determine styling of the object.
	const { active, readOnly, feedback } = inputData
	const classes = useStyles({
		maxWidth: options.maxWidth,
		active,
		readOnly,

		feedbackColor: feedback && feedback.color,
		feedbackType: feedback && feedback.type,
		hasFeedbackText: !!(feedback && feedback.text),
	})
	className = clsx(options.className, className, inputData.className, classes.DrawingInput, 'drawingInput', { active })

	// Show the drawing and the feedback box.
	return <div className={className}>
		<div className="drawing">{children}</div>
		<div className="feedbackText">{feedback && feedback.text}</div>
	</div>
}

// The useAsDrawingInput hook can be used by implementing components to get all data about the field. Its data (known as inputData) should be fed to the DrawingInput component.
export function useAsDrawingInput(options) {
	options = processOptions(options, defaultDrawingInputOptions)
	const drawing = options.drawingRef && options.drawingRef.current

	// Register as a regular input field.
	const inputData = useAsInput(filterOptions(options, defaultInputOptions))

	// Track and possibly snap the mouse position.
	let { snappers, snappingDistance } = options
	snappers = ensureArray(snappers)
	snappingDistance = ensureNumber(snappingDistance, true)
	const mouseData = useMouseSnapping(drawing, snappers, snappingDistance)

	// Return all data.
	return { ...inputData, ...mouseData }
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

// addFeedbackIcon takes HTML elements and adds a feedback icon to it.
export function addFeedbackIcon(htmlContents, feedback, drawingRef, scale = 1) {
	if (!feedback || !feedback.Icon)
		return htmlContents
	return <>
		{htmlContents}
		<PositionedElement anchor={[1, 0]} position={[drawingRef.current.width - 10, 6]} scale={scale} ><feedback.Icon className="icon" /></PositionedElement>
	</>
}
