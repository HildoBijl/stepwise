// The FBDInput is an input field for Free Body Diagrams. It takes 

import React, { forwardRef, useCallback, useMemo } from 'react'
import clsx from 'clsx'
import { makeStyles, useTheme } from '@material-ui/core/styles'

import { processOptions, filterOptions } from 'step-wise/util/objects'
import { hasSimpleDeepEqualsMatching } from 'step-wise/util/arrays'
import { selectRandomEmpty } from 'step-wise/util/random'
import { toFO, toSO } from 'step-wise/inputTypes'
import { PositionedVector } from 'step-wise/CAS/linearAlgebra'

import { useEnsureRef, useEventListener } from 'util/react'
import { DrawingInput, useAsDrawingInput, defaultDrawingInputOptions } from 'ui/components/figures/Drawing'

import EngineeringDiagram, { defaultEngineeringDiagramOptions, renderData } from './EngineeringDiagram'
import { defaultMoment } from './EngineeringDiagram/components/loads'

export const defaultFBDInputOptions = {
	...defaultEngineeringDiagramOptions,
	...defaultDrawingInputOptions,
	initialData: [],
	validate: nonEmpty,
	clickMarkerSize: 6,
	minimumDragDistance: 12,
	forceLength: 80, // The lengths of force vectors. Set to something falsy to make sure they have varying lengths.
	allowMoments: true,
	maximumMomentDistance: 50,
}

const useStyles = makeStyles((theme) => ({
	FBDInput: {
		'& .drawing': {
			'& .figureInner': {
				cursor: ({ isSnapped }) => isSnapped ? 'pointer' : 'crosshair',
			},
		},
	},
}))

function FBDInputUnforwarded(options, drawingRef) {
	const theme = useTheme()
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
			setData(data => [...data, dragObject])
	}

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
		active,
		data, setData,
		mouseData, mouseDownData,
	} = inputData

	// Deal with key presses.
	const keyDownHandler = useCallback((evt) => active && handleKeyPress(evt, setData), [setData, active])
	useEventListener('keydown', keyDownHandler)

	// Sort out styles.
	const classes = useStyles({ isSnapped: mouseData.isSnapped })
	const className = clsx(options.className, classes.FBDInput, 'FBDInput')

	// Add all drawn loads.
	const dragObject = getDragObject(mouseDownData, mouseData, options)
	const styledLoads = useMemo(() => data.map(load => styleLoad(load, theme)), [data, theme])
	options.svgContents = <>
		{options.svgContents}
		{renderData(styledLoads)}
		{dragObject && renderData(styleLoad(dragObject, theme))}
	</>

	// Render the Engineering Diagram with the proper styling.
	return <DrawingInput ref={drawingRef} Drawing={EngineeringDiagram} drawingProperties={Object.keys(defaultEngineeringDiagramOptions)
	} className={className} inputData={inputData} options={options} />
}
export const FBDInput = forwardRef(FBDInputUnforwarded)
export default FBDInput

function getDragObject(downData, upData, options) {
	// Don't draw if the mouse is not down or is not snapped. ToDo: remove this after selecting thingy.
	if (!downData || !downData.isSnapped)
		return null

	const { clickMarkerSize, minimumDragDistance, maximumMomentDistance, allowMoments, forceLength } = options

	// On a very short vector return a marker.
	const vector = upData.position.subtract(downData.snappedPosition)
	let snappedVector = upData.snappedPosition.subtract(downData.snappedPosition)
	if (snappedVector.squaredMagnitude <= minimumDragDistance ** 2)
		return { type: 'Square', center: downData.snappedPosition, side: clickMarkerSize, className: 'dragMarker' }

	// On a short distance return a moment.
	if (allowMoments && snappedVector.squaredMagnitude <= maximumMomentDistance ** 2) {
		const angle = vector.argument
		const opening = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2)
		return { type: 'Moment', position: downData.snappedPosition, opening, clockwise: angle < opening, selected: true }
	}

	// Otherwise return a Force. How to do this depends on if a fixed length has been set.
	if (!forceLength)
		return { type: 'Force', positionedVector: new PositionedVector({ start: downData.snappedPosition, end: upData.snappedPosition }), selected: true }
	snappedVector = snappedVector.setMagnitude(forceLength)
	if (upData.isSnappedTwice)
		return { type: 'Force', positionedVector: new PositionedVector({ vector: snappedVector, end: upData.snappedPosition }), selected: true }
	return { type: 'Force', positionedVector: new PositionedVector({ vector: snappedVector, start: downData.snappedPosition }), selected: true }
}

// These are validation functions.
export function nonEmpty(data) {
	if (data.length === 0)
		return selectRandomEmpty()
}

function doesLoadTouchRectangle(load, rectangle) {
	switch (load.type) {
		case 'Force':
			return rectangle.touchesPositionedVector(load.positionedVector)
		case 'Moment':
			return rectangle.touchesCircle(load.position, defaultMoment.radius)
		default:
			throw new Error(`Unknown load type: did not recognize the load type "${load.type}". Cannot process the selection.`)
	}
}

function styleLoad(load, theme) {
	load = { ...load }
	if (load.type === 'Force' || load.type === 'Moment')
		load.color = load.selected ? theme.palette.secondary.main : theme.palette.secondary.light
	delete load.selected
	return load
}

function handleKeyPress(evt, setData) {
	// On a delete remove all selected loads.
	if (evt.key === 'Delete' || evt.key === 'Backspace')
		return setData(data => data.filter(load => !load.selected))

	// On ctrl+a select all.
	if (evt.key === 'a' && evt.ctrlKey) {
		evt.preventDefault()
		return setData(data => data.map(load => ({ ...load, selected: true })))
	}
}

// These are functions transforming between object types.

// clean will remove all selection data from the FBD input. It then turns the items into SOs.
export function clean(data) {
	return toSO(data.map(load => {
		load = { ...load }
		delete load.selected
		return load
	}))
}

export function functionalize(data) {
	return toFO(data).map(load => ({ ...load, selected: false }))
}