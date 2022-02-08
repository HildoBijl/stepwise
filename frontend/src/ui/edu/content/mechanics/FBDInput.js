// The FBDInput is an input field for Free Body Diagrams. It takes 

import React, { forwardRef, useRef, useState, useImperativeHandle } from 'react'

import { processOptions, filterOptions } from 'step-wise/util/objects'
import { hasSimpleDeepEqualsMatching } from 'step-wise/util/arrays'
import { selectRandomEmpty } from 'step-wise/util/random'
import { toFO, toSO } from 'step-wise/inputTypes'
import { PositionedVector } from 'step-wise/CAS/linearAlgebra'

import { getEventPosition } from 'util/dom'
import { useEventListener } from 'util/react'
import { DrawingInput, useAsDrawingInput, defaultDrawingInputOptions, addSnapSvg, addFeedbackIcon } from 'ui/components/figures/Drawing'

import EngineeringDiagram, { defaultEngineeringDiagramOptions, renderData } from './EngineeringDiagram'

// Define some settings.
const clickMarkerSize = 6
const minimumDragDistance = 12
const maximumMomentDistance = 50

export const defaultFBDInputOptions = {
	...defaultEngineeringDiagramOptions,
	...defaultDrawingInputOptions,
	initialData: [],
	validate: nonEmpty,
}

function FBDInputUnforwarded(options, ref) {
	options = processOptions(options, defaultFBDInputOptions)

	// Sort out the various references.
	const drawingRef = useRef()
	useImperativeHandle(ref, () => drawingRef.current)
	const container = drawingRef.current && drawingRef.current.figure && drawingRef.current.figure.inner

	// Connect this field as a drawing input field.
	const inputData = useAsDrawingInput({
		...filterOptions(options, defaultDrawingInputOptions),
		element: container,
		drawingRef,
		clean,
		functionalize,
		equals: hasSimpleDeepEqualsMatching,
	})
	const {
		readOnly,
		data, setData,
		mousePosition, snappedMousePosition, isMouseSnapped, snapLines, snapper,
		feedback,
	} = inputData

	// Determine what object results from dragging.
	const [mouseDownPosition, setMouseDownPosition] = useState()
	const dragObject = dragToObject(mouseDownPosition, snappedMousePosition, mousePosition, isMouseSnapped)

	// Track the mouse position. On a mouse down start dragging, and on a mouse up end it.
	const startDrawing = (evt) => {
		if (readOnly)
			return
		if (mouseDownPosition)
			return setMouseDownPosition(undefined) // Second touch! Cancel drawing to prevent confusion.
		const point = drawingRef.current.getPosition(getEventPosition(evt))
		const snappedPoint = snapper(point).snappedMousePosition
		setMouseDownPosition(snappedPoint)
	}
	const endDrawing = () => {
		if (mouseDownPosition && snappedMousePosition) {
			let dragObjects = Array.isArray(dragObject) ? dragObject : [dragObject]
			dragObjects = dragObjects.filter(obj => obj.type === 'Force' || obj.type === 'Moment')
			setData(data => ({ ...data, loads: [...data.loads, ...dragObjects] }))
		}
		setMouseDownPosition(undefined)
	}
	useEventListener('mousedown', startDrawing, container)
	useEventListener('touchstart', startDrawing, container)
	useEventListener('mouseup', endDrawing)
	useEventListener('touchend', endDrawing)

	// Add all drawings.
	options.svgContents = <>
		{options.svgContents}
		{renderData(data.loads)}
		{dragObject && renderData(dragObject)}
	</>

	// Add snap lines and a feedback icon.
	options.svgContents = addSnapSvg(options.svgContents, snappedMousePosition, snapLines, drawingRef)
	options.htmlContents = addFeedbackIcon(options.htmlContents, feedback, drawingRef, 1.2)

	// Render the Engineering Diagram with the proper styling.
	return <DrawingInput inputData={inputData} options={options} className="FBDInput">
		<EngineeringDiagram ref={drawingRef} {...filterOptions(options, defaultEngineeringDiagramOptions)} />
	</DrawingInput>
}
export const FBDInput = forwardRef(FBDInputUnforwarded)
export default FBDInput

function dragToObject(mouseDownPosition, snappedMousePosition, mousePosition, isMouseSnapped) {
	// On missing data return null.
	if (!mouseDownPosition || !mousePosition || !snappedMousePosition)
		return null

	// On a very short vector return a marker.
	const vector = mousePosition.subtract(mouseDownPosition)
	const snappedVector = snappedMousePosition.subtract(mouseDownPosition)
	if (snappedVector.squaredMagnitude <= minimumDragDistance ** 2)
		return { type: 'Square', center: mouseDownPosition, side: clickMarkerSize, className: 'dragMarker' }

	// On a short distance return a moment.
	if (snappedVector.squaredMagnitude <= maximumMomentDistance ** 2) {
		const angle = vector.argument
		const opening = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2)
		return { type: 'Moment', position: mouseDownPosition, opening, clockwise: angle < opening }
	}

	// Otherwise return a Force.
	return { type: 'Force', positionedVector: new PositionedVector({ start: mouseDownPosition, end: snappedMousePosition }) }
}

// These are validation functions.
export function nonEmpty(data) {
	if (data.loads.length === 0)
		return selectRandomEmpty()
}

// These are functions transforming between object types.

export function clean(data) {
	return toSO(data.loads)
}

export function functionalize(data) {
	return {
		loads: toFO(data),
		selection: [],
	}
}