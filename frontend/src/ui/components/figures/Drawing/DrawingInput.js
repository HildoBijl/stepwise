// Within a drawing, you can make use of useAsDrawingInput to get some useful tools for DrawingInputs.

import React, { forwardRef, useMemo, useState, useCallback, createContext, useContext, useEffect, useRef } from 'react'
import clsx from 'clsx'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { alpha } from '@material-ui/core/styles/colorManipulator'
import { Delete } from '@material-ui/icons'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureArray, numberArray, filterDuplicates, sortByIndices } from 'step-wise/util/arrays'
import { processOptions, filterOptions, filterProperties, removeProperties } from 'step-wise/util/objects'
import { resolveFunctions } from 'step-wise/util/functions'
import { Vector, Line, Span, Rectangle } from 'step-wise/geometry'

import { getEventPosition, getUtilKeys } from 'util/dom'
import { useEventListener, useConsistentValue } from 'util/react'
import { notSelectable } from 'ui/theme'
import { useAsInput, defaultInputOptions } from 'ui/form/inputs/support/Input'

import { defaultDrawingOptions, useGraphicalMousePosition } from './Drawing'
import { Element } from './HtmlComponents'
import { Line as SvgLine, Square, Rectangle as SvgRectangle } from './SvgComponents'
import { applyTransformation } from './transformation'

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
	applySnapping: true,
	snappingDistance: 24,
	startDrag: undefined,
	endDrag: undefined,
	startSelection: startSelectionOptions.noSnap,
	processSelection: undefined,
	stopSnapOnSelection: true,
	onDelete: undefined,
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
				cursor: ({ readOnly }) => readOnly ? 'default' : 'pointer',
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
				display: 'block',

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
					fill: alpha(theme.palette.primary.main, 0.03),
					stroke: theme.palette.primary.main,
					strokeWidth: 0.5,
					strokeDasharray: '4 2',
					opacity: 0.7,
				},
			},
		},

		'& .deleteButton': {
			background: 'rgba(0, 0, 0, 0.1)',
			borderRadius: '10rem',
			cursor: 'pointer',
			opacity: 0.7,
			padding: '0.3rem',
			'&:hover': {
				opacity: 1,
			},
			'& svg': {
				width: 'auto',
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
	const drawing = options.drawingRef?.current
	const container = drawing?.figure?.inner
	let { snappers, applySnapping, snappingDistance, startSelection, processSelection } = options

	// Define required states.
	const [mouseDownData, setMouseDownData] = useState()

	// Register as a regular input field.
	const inputData = useAsInput(filterOptions(options, defaultInputOptions))
	const { readOnly } = inputData

	// Track and possibly snap the mouse position.
	snappers = ensureArray(snappers)
	snappingDistance = ensureNumber(snappingDistance, true)
	const mouseData = useMouseSnapping(drawing, snappers, snappingDistance, applySnapping && !readOnly)
	const { snapper } = mouseData

	// Set up the selection rectangle.
	const isSelecting = !!processSelection && shouldBeSelecting(mouseDownData, startSelection) && mouseData && mouseData.position
	const selectionRectangle = isSelecting ? getSelectionRectangle(mouseDownData, mouseData, drawing) : undefined

	// Set up handler functions.
	const cancelDrag = useCallback(() => {
		setMouseDownData(undefined)
	}, [setMouseDownData])

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
	useEventListener(['mousedown', 'touchstart'], startDrag, container, { passive: false })
	useEventListener(['mouseup', 'touchend'], endDrag)

	// Return all data.
	return { ...inputData, mouseData, mouseDownData, selectionRectangle, cancelDrag }
}

// The DrawingInput wrapper needs to be used to add the right classes and to properly position potential feedback.
export function DrawingInputUnforwarded({ Drawing, drawingProperties, className, inputData, options = {} }, drawingRef) {
	const drawingOptions = drawingProperties ? filterProperties(options, drawingProperties) : options
	options = processOptions(options, defaultDrawingInputOptions, true)
	let { maxWidth, stopSnapOnSelection, feedbackIconScale, onDelete, transformationSettings } = options
	const { active, readOnly, mouseData, feedback, selectionRectangle } = inputData
	const drawing = drawingRef && drawingRef.current
	maxWidth = resolveFunctions(maxWidth, transformationSettings.graphicalBounds)
	let { svgContents, htmlContents } = drawingOptions

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

	// When an onDelete function is given, show a Garbage icon. Also track the mouse position, whether it's over the button or not, to prevent snapping. And prevent the click from processing when it happens.
	const [isOverDeleteButton, setIsOverDeleteButton] = useState(false)
	const onDeleteWithStopPropagation = useMemo(() => onDelete && ((evt) => {
		evt.stopPropagation()
		onDelete(evt)
	}), [onDelete])
	if (onDeleteWithStopPropagation) {
		htmlContents = <>
			{htmlContents}
			<Element anchor={[1, 1]} graphicalPosition={[drawing.width - 10, drawing.height - 10]} scale={1.5} ignoreMouse={false} ><DeleteButton onDelete={onDeleteWithStopPropagation} onMouseEnter={() => setIsOverDeleteButton(true)} onMouseLeave={() => setIsOverDeleteButton(false)} /></Element>
		</>
	}
	useEffect(() => {
		if (!onDelete)
			setIsOverDeleteButton(false)
	}, [onDelete, setIsOverDeleteButton])

	// Add snap lines when the mouse is not over a button.
	const isOverButton = isOverDeleteButton
	svgContents = addSelectionRectangle(svgContents, selectionRectangle, drawing)
	if ((!selectionRectangle || !stopSnapOnSelection) && !isOverButton)
		svgContents = addSnapSvg(svgContents, mouseData, drawing)

	// Add a feedback icon when appropriate.
	htmlContents = addFeedbackIcon(htmlContents, feedback, drawing, feedbackIconScale)

	// Show the drawing and the feedback box.
	return <div className={className}>
		<IsInDrawingInputContext.Provider value={true}>
			<div className="drawing">
				<Drawing ref={drawingRef} {...{ ...drawingOptions, svgContents, htmlContents }} />
			</div>
		</IsInDrawingInputContext.Provider>
		<div className="feedbackText">{feedback && feedback.text}</div>
	</div>
}
export const DrawingInput = forwardRef(DrawingInputUnforwarded)
export default DrawingInput

// useIsInDrawingInput returns true or false: is the given element inside of a DrawingInput.
const IsInDrawingInputContext = createContext(false)
export function useIsInDrawingInput() {
	const isInDrawingInput = useContext(IsInDrawingInputContext)
	return !!isInDrawingInput
}
export function useCurrentBackgroundColor() {
	const inDrawingInput = useIsInDrawingInput()
	const theme = useTheme()
	return inDrawingInput ? theme.palette.inputBackground.main : theme.palette.background.main
}

// useMouseSnapping wraps all the snapping functionalities into one hook. It takes a drawing, a set of snappers and a snapping distance and takes care of all the mouse functionalities.
function useMouseSnapping(drawing, snappers, snappingDistance, applySnapping) {
	// Retrieve the current mouse position in both coordinate systems.
	const graphicalPosition = useGraphicalMousePosition(drawing)
	const inverseTransformation = drawing?.transformationSettings?.inverseTransformation
	const position = inverseTransformation && graphicalPosition && inverseTransformation.apply(graphicalPosition)

	// Get the snapping lines in both coordinate systems.
	const transformation = drawing?.transformationSettings?.transformation
	const { snappingLines, graphicalSnappingLines } = useSnappingLines(snappers, transformation)

	// Set up a snapper function.
	const snapper = useCallback((position) => snapMousePosition(position, snappingLines, graphicalSnappingLines, transformation, inverseTransformation, snappingDistance, applySnapping), [snappingLines, graphicalSnappingLines, transformation, inverseTransformation, snappingDistance, applySnapping])

	// If no drawing data is available, return a default outcome.
	if (!drawing || !drawing.transformationSettings)
		return { mouseInDrawing: false, snappingLines, graphicalSnappingLines, snapper: () => emptySnapMousePositionResponse, ...emptySnapMousePositionResponse }

	// Return all data.
	const mouseInDrawing = drawing && position && drawing.transformationSettings.graphicalBounds.isInside(position)
	const snapResult = snapper(position)
	return { mouseInDrawing, snappingLines, graphicalSnappingLines, snapper, ...snapResult }
}

// useSnappingLines takes a snappers array and determines the snapping lines from it. It only recalculates on a change and filters duplicates.
function useSnappingLines(snappers, transformation) {
	snappers = useConsistentValue(snappers)
	return useMemo(() => {
		// If no transformation is known yet, return empty arrays.
		if (!transformation)
			return { snappingLines: [], graphicalSnappingLines: [] }

		// Determine the snapping lines from the given snappers.
		let snappingLines = []
		snappers.forEach(snapper => {
			if (snapper instanceof Line) {
				snappingLines.push(snapper)
			} else if (snapper instanceof Vector) {
				snappingLines.push(Line.getHorizontalThrough(snapper))
				snappingLines.push(Line.getVerticalThrough(snapper))
			} else if (snapper instanceof Span) {
				snappingLines.push(snapper.line)
			} else {
				throw new Error(`Invalid snapper: received a snapper with unexpected type. Make sure it is a vector, line or other allowed type.`)
			}
		})

		// Ensure there are no duplicate snapping lines.
		snappingLines = filterDuplicates(snappingLines, (a, b) => a.equals(b))

		// Transform snapping lines to graphical coordinates.
		const graphicalSnappingLines = applyTransformation(snappingLines, transformation)
		return { snappingLines, graphicalSnappingLines }
	}, [snappers, transformation])
}

// snapMousePosition will calculate the position of the mouse after it's snapped to the nearest snapping line. For this, it's turned to graphical coordinates, snapped to the appropriate graphicalSnappingLine, and subsequently transformed back.
function snapMousePosition(position, snappingLines, graphicalSnappingLines, transformation, inverseTransformation, snappingDistance, applySnapping) {
	// If there is no position, then nothing can be done.
	if (!position)
		return emptySnapMousePositionResponse

	// If no snapping should be applied, keep the given position.
	const graphicalPosition = transformation.apply(position)
	if (!applySnapping)
		return { ...emptySnapMousePositionResponse, position, snappedPosition: position, graphicalPosition, graphicalSnappedPosition: graphicalPosition }

	// Get all the lines that fall (in graphical coordinates) within snapping distance of the given point.
	const squaredSnappingDistance = snappingDistance ** 2
	const snappingLineSquaredDistances = graphicalSnappingLines.map(line => line.getSquaredDistanceFrom(graphicalPosition)) // Calculate the squared distances.
	let selectedLines = numberArray(0, snappingLines.length - 1).filter(index => snappingLineSquaredDistances[index] <= squaredSnappingDistance) // Filter out all lines that are too far, and store the indices of the selected lines.
	selectedLines = sortByIndices(selectedLines, selectedLines.map(index => snappingLineSquaredDistances[index])) // Sort by distance.

	// Depending on how many snap lines there are, snap the mouse position accordingly.
	let graphicalSnappedPosition = graphicalPosition
	if (selectedLines.length > 1) { // Multiple lines. Find the intersection and check that it's close enough to the mouse point.
		const intersection = graphicalSnappingLines[selectedLines[0]].getIntersection(graphicalSnappingLines[selectedLines[1]])
		if (intersection.getSquaredDistanceTo(graphicalPosition) <= squaredSnappingDistance) {
			graphicalSnappedPosition = intersection
			selectedLines = selectedLines.filter(index => graphicalSnappingLines[index].containsPoint(intersection)) // Get rid of all snapping lines that don't go through this point.
		} else {
			selectedLines = [selectedLines[0]] // The snap position is too far from the mouse position. Only take the closest line and use that.
		}
	}
	if (selectedLines.length === 1)
		graphicalSnappedPosition = graphicalSnappingLines[selectedLines[0]].getClosestPoint(graphicalPosition)
	const snappedPosition = inverseTransformation.apply(graphicalSnappedPosition)
	const snapLines = selectedLines.map(index => snappingLines[index])
	const graphicalSnapLines = selectedLines.map(index => graphicalSnappingLines[index])
	const isSnapped = snapLines.length > 0
	const isSnappedTwice = snapLines.length > 1

	// Return the outcome.
	return { position, snappedPosition, graphicalPosition, graphicalSnappedPosition, snapLines, graphicalSnapLines, isSnapped, isSnappedTwice }
}
const emptySnapMousePositionResponse = { position: undefined, snappedPosition: undefined, graphicalPosition: undefined, graphicalSnappedPosition: undefined, snapLines: [], graphicalSnapLines: [], isSnapped: false, isSnappedTwice: false }

export function getMouseData(evt, snapper, drawing) {
	return { ...snapper(drawing.getDrawingCoordinates(getEventPosition(evt))), utilKeys: getUtilKeys(evt) }
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
		marker: snapLines.length > 0 ? <Square center={snappedPosition} graphicalSide={snapMarkerSize} className="snapMarker" style={markerStyle} /> : null,
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
	if (!feedback || !feedback.Icon || !drawing)
		return htmlContents
	return <>
		{htmlContents}
		<Element anchor={[1, 0]} graphicalPosition={[drawing.width - 8, 6]} scale={scale} ><feedback.Icon className="icon" /></Element>
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

// DeleteButton is a button of a garbage bin icon.
function DeleteButton(props) {
	const ref = useRef()
	useEventListener(['mousedown', 'touchstart'], props.onDelete, ref)
	return <div ref={ref} className="deleteButton" {...removeProperties(props, 'onDelete')}><Delete /></div>
}
