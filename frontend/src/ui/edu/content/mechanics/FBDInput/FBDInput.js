// The FBDInput is an input field for Free Body Diagrams. It takes 

import React, { forwardRef, useCallback, useMemo, useState, useEffect } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { defaultForceLength } from 'step-wise/settings/engineeringMechanics'
import { processOptions, filterOptions, applyToEachParameter } from 'step-wise/util/objects'
import { hasSimpleDeepEqualsMatching } from 'step-wise/util/arrays'
import { Vector, PositionedVector } from 'step-wise/CAS/linearAlgebra'
import { areLoadsEqual, doesLoadTouchRectangle } from 'step-wise/edu/exercises/util/engineeringMechanics'

import { useEnsureRef, useEventListener } from 'util/react'
import { DrawingInput, useAsDrawingInput, defaultDrawingInputOptions } from 'ui/components/figures/Drawing'

import EngineeringDiagram, { defaultEngineeringDiagramOptions, renderData, loadColors } from '../EngineeringDiagram'

import { clean, functionalize } from './support'
import { nonEmptyNoDoubles } from './validation'

export const defaultFBDInputOptions = {
	...defaultEngineeringDiagramOptions,
	...defaultDrawingInputOptions,
	initialData: [],
	validate: nonEmptyNoDoubles,
	clickMarkerSize: 6,
	minimumDragDistance: 12,
	forceLength: defaultForceLength, // The lengths of force vectors. Set to something falsy to make sure they have varying lengths.
	allowMoments: true,
	maximumMomentDistance: 50,
}

const useStyles = makeStyles((theme) => ({
	FBDInput: {
		'& .drawing': {
			'& .figureInner': {
				cursor: ({ isSnapped, readOnly }) => readOnly ? 'default' : (isSnapped ? 'pointer' : 'crosshair'),
			},
		},
	},
}))

function FBDInputUnforwarded(options, drawingRef) {
	options = processOptions(options, defaultFBDInputOptions)

	// Sort out references.
	drawingRef = useEnsureRef(drawingRef)
	const container = drawingRef.current && drawingRef.current.figure && drawingRef.current.figure.inner

	// When a selection ends, process the selected objects.
	options.processSelection = (selectionRectangle, utilKeys) => {
		setData(data => data.map(load => ({
			...load,
			selected: doesLoadTouchRectangle(load, selectionRectangle) || (utilKeys.shift && load.selected),
		})))
	}

	// When a draw starts, deselect all. When a drag ends, add a load.
	options.startDrag = () => {
		setData(data => data.map(load => ({ ...load, selected: false })))
	}
	options.endDrag = (downState, upState) => {
		const dragObject = getDragObject(downState, upState, options)
		if (dragObject && ['Force', 'Moment'].includes(dragObject.type))
			setData(data => [...data, { ...dragObject, selected: true }])
	}

	// Track the hover status.
	const [hoverIndex, setHoverIndex] = useState()

	// Connect this field as a drawing input field.
	const inputData = useAsDrawingInput({
		...filterOptions(options, defaultDrawingInputOptions),
		element: container,
		drawingRef,
		clean,
		functionalize,
		equals: hasSimpleDeepEqualsMatching,
		applySnapping: hoverIndex === undefined, // On hovering prevent snapping.
	})
	const {
		readOnly, active, activateField,
		data, setData,
		mouseData, mouseDownData, selectionRectangle, cancelDrag,
		feedback,
	} = inputData

	// On becoming inactive, deselect all loads.
	useEffect(() => {
		if (!active)
			setData(data => data.some(load => load.selected) ? data.map(load => load.selected ? { ...load, selected: false } : load) : data)
	}, [active, setData])

	// Handle deletions.
	const deleteSelection = useCallback(() => {
		setData(data => data.filter(load => !load.selected))
		setHoverIndex(undefined) // Ensure we don't remember a hover over a deleted arrow.
	}, [setData])
	const hasSelectedLoad = data.some(load => load.selected)
	options.onDelete = !readOnly && hasSelectedLoad ? deleteSelection : undefined

	// Deal with key presses.
	const keyDownHandler = useCallback((evt) => active && handleKeyPress(evt, setData, deleteSelection), [setData, active, deleteSelection])
	useEventListener('keydown', keyDownHandler)

	// Deal with mouse enters/leaves.
	const mouseHandlers = useMemo(() => readOnly ? {} : {
		mouseenter: (hoverIndex) => setHoverIndex(hoverIndex),
		mouseleave: () => setHoverIndex(undefined),
		mousedown: (hoverIndex, evt) => {
			evt.stopPropagation() // Prevent a drag start.
			setHoverIndex(undefined) // Cancel any remaining hover (useful for touch devices).
			cancelDrag() // Cancel a dragging effect, to prevent that a (tiny) rectangle will be processed resulting in a deselect.
			activateField() // Activate the field if not already active.
			setData(data => {
				// When the shift key is selected, or when no other loads are selected, flip the selection of the chosen load. Maintain object continuity wherever possible.
				if (evt.shiftKey || !data.some((load, index) => (index !== hoverIndex && load.selected)))
					return data.map((load, index) => index === hoverIndex ? { ...load, selected: !load.selected } : load)

				// In other cases, make sure that only the chosen load is selected.
				return data.map((load, index) => (load.selected === (index === hoverIndex)) ? load : { ...load, selected: !load.selected })
			})
		},
	}, [readOnly, setData, activateField, cancelDrag])

	// Sort out styles.
	const classes = useStyles({ isSnapped: mouseData.isSnapped, readOnly })
	const className = clsx(options.className, classes.FBDInput, 'FBDInput')

	// Add all drawn loads.
	const dragObject = getDragObject(mouseDownData, mouseData, options)
	const styledLoads = useMemo(() => data.map((load, index) => styleLoad(index, { ...load, hovering: index === hoverIndex }, readOnly, mouseHandlers, selectionRectangle, feedback)), [data, hoverIndex, readOnly, mouseHandlers, selectionRectangle, feedback])
	options.svgContents = <>
		{options.svgContents}
		{renderData(styledLoads)}
		{dragObject && renderData(styleLoad(undefined, dragObject, readOnly))}
	</>

	// Render the Engineering Diagram with the proper styling.
	return <DrawingInput ref={drawingRef} Drawing={EngineeringDiagram} drawingProperties={Object.keys(defaultEngineeringDiagramOptions)
	} className={className} inputData={inputData} options={options} />
}
export const FBDInput = forwardRef(FBDInputUnforwarded)
export default FBDInput

function getDragObject(downData, upData, options) {
	// Don't draw if the mouse is not down or is not snapped.
	if (!downData || !downData.isSnapped || !upData || !upData.position)
		return null

	const { clickMarkerSize, minimumDragDistance, maximumMomentDistance, allowMoments, forceLength } = options
	let snappedVector = upData.snappedPosition.subtract(downData.snappedPosition)

	// On a double snap, always give a force.
	if (upData.isSnappedTwice && !snappedVector.isZero()) {
		if (forceLength)
			snappedVector = snappedVector.setMagnitude(forceLength)
		return { type: 'Force', positionedVector: new PositionedVector({ vector: snappedVector, end: upData.snappedPosition }) }
	}

	// On a very short vector return a marker.
	const vector = upData.position.subtract(downData.snappedPosition)
	if (snappedVector.squaredMagnitude <= minimumDragDistance ** 2)
		return { type: 'Square', center: downData.snappedPosition, side: clickMarkerSize, className: 'dragMarker' }

	// On a short distance return a moment.
	if (allowMoments && snappedVector.squaredMagnitude <= maximumMomentDistance ** 2) {
		const angle = vector.argument
		const opening = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2)
		return { type: 'Moment', position: downData.snappedPosition, opening, clockwise: angle < opening }
	}

	// Otherwise return a Force. How to do this depends on if a fixed length has been set.
	if (forceLength)
		snappedVector = snappedVector.setMagnitude(forceLength)
	return { type: 'Force', positionedVector: new PositionedVector({ start: downData.snappedPosition, vector: snappedVector }) }
}

function styleLoad(index, load, readOnly, mouseHandlers = {}, selectionRectangle, feedback) {
	load = { ...load }

	// Only style actual loads and not selection markers.
	if (load.type === 'Force' || load.type === 'Moment') {
		const inSelectionRectangle = selectionRectangle && doesLoadTouchRectangle(load, selectionRectangle)
		const hoverStatus = getHoverStatus(load.selected, load.hovering, inSelectionRectangle)
		load = {
			...load,
			color: loadColors.input,
			style: readOnly ? {} : {
				filter: `url(#selectionFilter${hoverStatus})`,
				cursor: 'pointer',
			},
			...applyToEachParameter(mouseHandlers, handler => (evt) => handler(index, evt)),
		}

		// On feedback apply the specific color.
		if (feedback && feedback.affectedLoads && feedback.affectedLoads.some(affectedLoad => areLoadsEqual(load, affectedLoad)))
			load.color = feedback.color
	}

	// Remove selection/hovering data.
	delete load.selected
	delete load.hovering
	return load
}

function getHoverStatus(selected, hovering, inSelectionRectangle) {
	if (selected)
		return hovering || inSelectionRectangle ? 2 : 3
	return hovering || inSelectionRectangle ? 1 : 0
}

function handleKeyPress(evt, setData, deleteSelection) {
	// On a delete remove all selected loads.
	if (evt.key === 'Delete' || evt.key === 'Backspace') {
		evt.preventDefault()
		return deleteSelection()
	}

	// On ctrl+a select all.
	if (evt.key === 'a' && evt.ctrlKey) {
		evt.preventDefault()
		return setData(data => data.map(load => ({ ...load, selected: true })))
	}

	// On an escape or ctrl+d deselect all.
	if (evt.key === 'Escape' || (evt.key === 'd' && evt.ctrlKey)) {
		evt.preventDefault()
		return setData(data => data.map(load => ({ ...load, selected: false })))
	}
}

// getDefaultForceVector can take an angle and directly give a force vector with the given angle.
export const getDefaultForceVector = (angle) => Vector.fromPolar(defaultFBDInputOptions.forceLength, angle)