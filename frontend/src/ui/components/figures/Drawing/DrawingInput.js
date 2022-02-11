// Within a drawing, you can make use of useAsDrawingInput to get some useful tools for DrawingInputs.

import React, { forwardRef, useMemo, useState } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import { alpha } from '@material-ui/core/styles/colorManipulator'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureArray, numberArray, filterDuplicates, sortByIndices } from 'step-wise/util/arrays'
import { processOptions, filterOptions, filterProperties } from 'step-wise/util/objects'
import { Vector, Line, PositionedVector, Rectangle } from 'step-wise/CAS/linearAlgebra'

import { getEventPosition, getUtilKeys } from 'util/dom'
import { useEventListener } from 'util/react'
import { notSelectable } from 'ui/theme'
import { useAsInput, defaultInputOptions } from 'ui/form/inputs/support/Input'

import { defaultDrawingOptions, useMousePosition, PositionedElement } from './Drawing'
import { Line as SvgLine, Square, Rectangle as SvgRectangle } from './components'

export const startSelectionOptions = {
	never: 0,
	noDoubleSnap: 1,
	noSnap: 2,
	always: 3,
}

export const defaultDrawingInputOptions = {
	...defaultInputOptions,
	...defaultDrawingOptions,
	drawingRef: null,
	feedbackIconScale: 1.2,
	snappers: [],
	snappingDistance: 10,
	startDrag: undefined,
	endDrag: undefined,
	startSelection: startSelectionOptions.noSnap,
	processSelection: undefined,
	stopSnapOnSelection: true,
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

			'& svg': {
				// Snapping system style.
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
					stroke: theme.palette.secondary.dark,
					strokeWidth: 2,
				},

				// Selection style.
				'& .selectionRectangle': {
					fill: alpha(theme.palette.primary.main, 0.2),
					stroke: theme.palette.primary.main,
					strokeWidth: 1,
					opacity: 0.4,
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

// The useAsDrawingInput hook can be used by implementing components to get all data about the field. Its data (known as inputData) should be fed to the DrawingInput component.
export function useAsDrawingInput(options) {
	options = processOptions(options, defaultDrawingInputOptions)
	const drawing = options.drawingRef && options.drawingRef.current
	const container = drawing && drawing.figure && drawing.figure.inner
	let { snappers, snappingDistance, startSelection, processSelection } = options

	// Define required states.
	const [mouseDownData, setMouseDownData] = useState()

	// Register as a regular input field.
	const inputData = useAsInput(filterOptions(options, defaultInputOptions))
	const { readOnly } = inputData

	// Track and possibly snap the mouse position.
	snappers = ensureArray(snappers)
	snappingDistance = ensureNumber(snappingDistance, true)
	const mouseData = useMouseSnapping(drawing, snappers, snappingDistance)
	const { snapper } = mouseData

	// Set up the selection rectangle.
	const isSelecting = !!processSelection && shouldBeSelecting(mouseDownData, startSelection)
	const selectionRectangle = isSelecting ? getSelectionRectangle(mouseDownData, mouseData, drawing) : undefined

	// Monitor the mouse going down and up.
	const startDrag = (evt) => {
		if (readOnly)
			return
		if (mouseDownData)
			return setMouseDownData(undefined) // Second touch! Cancel drawing to prevent confusion.
		const newMouseDownData = getMouseData(evt, snapper, drawing)
		const isSelecting = shouldBeSelecting(newMouseDownData, startSelection)
		if (!isSelecting && options.startDrag)
			options.startDrag(newMouseDownData)
		setMouseDownData(newMouseDownData)
	}
	const endDrag = (evt) => {
		if (readOnly || !mouseDownData)
			return
		const mouseUpData = getMouseData(evt, snapper, drawing)
		if (isSelecting && options.processSelection)
			options.processSelection(getSelectionRectangle(mouseDownData, mouseUpData, drawing), mouseUpData.utilKeys)
		if (!isSelecting && options.endDrag)
			options.endDrag(mouseDownData, mouseUpData)
		setMouseDownData(undefined)
	}
	useEventListener('mousedown', startDrag, container)
	useEventListener('touchstart', startDrag, container)
	useEventListener('mouseup', endDrag)
	useEventListener('touchend', endDrag)

	// Return all data.
	return { ...inputData, mouseData, mouseDownData, selectionRectangle }
}

// The DrawingInput wrapper needs to be used to add the right classes and to properly position potential feedback.
export function DrawingInputUnforwarded({ Drawing, drawingProperties, className, inputData, options = {} }, drawingRef) {
	const drawingOptions = drawingProperties ? filterProperties(options, drawingProperties) : options
	options = processOptions(options, defaultDrawingInputOptions, true)
	let { maxWidth, stopSnapOnSelection, feedbackIconScale } = options
	const { active, readOnly, mouseData, feedback, selectionRectangle } = inputData
	const drawing = drawingRef && drawingRef.current

	// Determine styling of the object.
	const classes = useStyles({
		maxWidth,
		active,
		readOnly,

		feedbackColor: feedback && feedback.color,
		feedbackType: feedback && feedback.type,
		hasFeedbackText: !!(feedback && feedback.text),
	})
	className = clsx(options.className, className, inputData.className, classes.DrawingInput, 'drawingInput', { active })

	// Add snap lines and a feedback icon.
	let { svgContents, htmlContents } = drawingOptions
	svgContents = addSelectionRectangle(svgContents, selectionRectangle, drawing)
	if (!selectionRectangle || !stopSnapOnSelection)
		svgContents = addSnapSvg(svgContents, mouseData, drawing)
	htmlContents = addFeedbackIcon(htmlContents, feedback, drawing, feedbackIconScale)

	// Show the drawing and the feedback box.
	return <div className={className}>
		<div className="drawing"><Drawing ref={drawingRef} {...{ ...drawingOptions, svgContents, htmlContents }} /></div>
		<div className="feedbackText">{feedback && feedback.text}</div>
	</div>
}
export const DrawingInput = forwardRef(DrawingInputUnforwarded)
export default DrawingInput

// useMouseSnapping wraps all the snapping functionalities into one hook. It takes a drawing, a set of snappers and a snapping distance and takes care of all the mouse functionalities.
function useMouseSnapping(drawing, snappers, snappingDistance) {
	// Process the current mouse position.
	const mousePosition = useMousePosition(drawing)
	const mouseInDrawing = drawing ? drawing.isInside(mousePosition) : false

	// Extract snapping lines and set up a snapper based on it.
	const snappingLines = useSnappingLines(snappers)
	const snapper = (point) => snapMousePosition(point, snappingLines, snappingDistance)
	const snapResult = snapper(mousePosition)

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
function snapMousePosition(position, snappingLines, snappingDistance) {
	// Check that a mouse position exists.
	if (!position)
		return { position, snappedPosition: position, snapLines: [], isSnapped: false, isSnappedTwice: false }

	// Get all the lines that fall within snapping distance.
	const squaredSnappingDistance = snappingDistance ** 2
	const snappingLineSquaredDistances = snappingLines.map(line => line.getSquaredDistanceFrom(position)) // Calculate the squared distances.
	const selectedLines = numberArray(0, snappingLines.length - 1).filter(index => snappingLineSquaredDistances[index] <= squaredSnappingDistance) // Filter out all lines that are too far, and store the indices of the selected lines.
	let snapLines = sortByIndices(selectedLines.map(index => snappingLines[index]), selectedLines.map(index => snappingLineSquaredDistances[index])) // Sort by distance.

	// Depending on how many snap lines there are, snap the mouse position accordingly.
	let snappedPosition = position
	if (snapLines.length > 1) { // Multiple lines. Find the intersection and check that it's close enough to the mouse point.
		const intersection = snapLines[0].getIntersection(snapLines[1])
		if (intersection.squaredDistanceTo(position) <= squaredSnappingDistance) {
			snappedPosition = intersection
			snapLines = snapLines.filter(line => line.containsPoint(snappedPosition)) // Get rid of all snapping lines that don't go through this point.
		} else {
			snapLines = snapLines.slice(0, 1) // The snap position is too far from the mouse position. Only take the closest line and use that.
		}
	}
	if (snapLines.length === 1)
		snappedPosition = snapLines[0].getClosestPoint(position)
	const isSnapped = snapLines.length > 0
	const isSnappedTwice = snapLines.length > 1

	// Return the outcome.
	return { position, snappedPosition, snapLines, isSnapped, isSnappedTwice }
}

export function getMouseData(evt, snapper, drawing) {
	return { ...snapper(drawing.getPosition(getEventPosition(evt))), utilKeys: getUtilKeys(evt) }
}

// getSnapSvg takes a snapped mouse position and snap lines, and returns SVG to show the marker and the lines.
export function getSnapSvg(mouseData, drawing, lineStyle = {}, markerStyle = {}, snapMarkerSize = 6) {
	const { position, snappedPosition, snapLines } = mouseData
	const bounds = drawing && drawing.bounds

	// Don't show things when the mouse is outside the drawing.
	if (!drawing.isInside(position))
		return {}

	// Show the snap marker and lines.
	return {
		marker: snapLines.length > 0 ? <Square center={snappedPosition} side={snapMarkerSize} className="snapMarker" style={markerStyle} /> : null,
		lines: bounds ? snapLines.map((line, index) => {
			const linePart = bounds.getLinePart(line)
			return <SvgLine key={index} className="snapLine" points={[linePart.start, linePart.end]} style={lineStyle} />
		}) : [],
	}
}

// addSnapSvg takes SVG elements and adds snap lines to it.
export function addSnapSvg(svgContents, mouseData, drawing) {
	// If the drawing is not there yet, don't add lines.
	if (!drawing)
		return svgContents

	// Get the lines and marker and display them in the right order.
	const snapSvg = getSnapSvg(mouseData, drawing)
	return <>
		{snapSvg.lines}
		{svgContents}
		{snapSvg.marker}
	</>
}

// addFeedbackIcon takes HTML elements and adds a feedback icon to it.
export function addFeedbackIcon(htmlContents, feedback, drawing, scale = 1) {
	if (!feedback || !feedback.Icon)
		return htmlContents
	return <>
		{htmlContents}
		<PositionedElement anchor={[1, 0]} position={[drawing.width - 10, 6]} scale={scale} ><feedback.Icon className="icon" /></PositionedElement>
	</>
}

// shouldBeSelecting gets mouseDownData and startSelection options and determines if we're selecting.
function shouldBeSelecting(mouseDownData, startSelection) {
	// Don't start selecting if the mouse didn't go down.
	if (!mouseDownData)
		return false

	// Check the settings.
	switch (startSelection) {
		case startSelectionOptions.never:
			return false
		case startSelectionOptions.noDoubleSnap:
			return !mouseDownData.isSnappedTwice
		case startSelectionOptions.noSnap:
			return !mouseDownData.isSnapped
		case startSelectionOptions.always:
			return true
		default:
			throw new Error(`Invalid startSelection setting: received a setting of "${startSelection}" for startSelection on a DrawingInput, but this was not among the valid options.`)
	}
}

// getSelectionRectangle returns the selection rectangle based on two mouse data objects.
function getSelectionRectangle(downData, upData, drawing) {
	return new Rectangle({
		start: drawing.applyBounds(downData.position),
		end: drawing.applyBounds(upData.position),
	})
}

// addSelectionRectangle takes an svgContents object and adds a selection rectangle on top of it.
function addSelectionRectangle(svgContents, selectionRectangle) {
	return selectionRectangle ? <>
		{svgContents}
		<SvgRectangle className="selectionRectangle" dimensions={selectionRectangle} />
	</> : svgContents
}
