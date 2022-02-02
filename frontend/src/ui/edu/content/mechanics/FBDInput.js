// The FBDInput is an input field for Free Body Diagrams. It takes 

import React, { forwardRef, useRef, useState, useImperativeHandle } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import { alpha } from '@material-ui/core/styles/colorManipulator'

import { processOptions, filterOptions } from 'step-wise/util/objects'
import { noop } from 'step-wise/util/functions'
import { PositionedVector } from 'step-wise/CAS/linearAlgebra'

import { getEventPosition } from 'util/dom'
import { useRefWithValue, useEventListener } from 'util/react'
import { notSelectable } from 'ui/theme'
import { useAsDrawingInput, defaultDrawingInputOptions, addSnapSvg } from 'ui/components/figures/Drawing'

import EngineeringDiagram, { defaultEngineeringDiagramOptions, Force } from './EngineeringDiagram'

export const defaultFBDInputOptions = {
	...defaultEngineeringDiagramOptions,
	...defaultDrawingInputOptions,
	id: undefined,
	initialData: { type: 'FBD', forces: [], moments: [] }, // ToDo: put this initial FBD value in a central place.
	autofocus: false,
	validate: noop,
}

const useStyles = makeStyles((theme) => ({
	FBDInput: {
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
	},
}))

function FBDInputUnforwarded(options, ref) {
	options = processOptions(options, defaultFBDInputOptions)

	// Sort out the various references.
	const drawingRef = useRef()
	useImperativeHandle(ref, () => drawingRef.current)
	const container = drawingRef.current && drawingRef.current.figure && drawingRef.current.figure.inner

	// Connect this field as a drawing input field.
	const {
		readOnly, active,
		data, setData,
		className, snappedMousePosition, snapLines, snapper,
	} = useAsDrawingInput({
		...filterOptions(options, defaultDrawingInputOptions),
		element: container,
		drawingRef,
	})

	// Track the mouse position. On a mouse down start dragging, and on a mouse up end it.
	const [mouseDownPosition, setMouseDownPosition] = useState()
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
		if (mouseDownPosition) {
			if (snappedMousePosition)
				setData(data => ({ ...data, forces: [...data.forces, new PositionedVector({ start: mouseDownPosition, end: snappedMousePosition })] }))
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
		{data.forces.map((force, index) => <Force key={index} positionedVector={force} />)}
		{snappedMousePosition && mouseDownPosition ? <Force positionedVector={{ start: mouseDownPosition, end: snappedMousePosition }} /> : null}
	</>

	// Add snap lines.
	options.svgContents = addSnapSvg(options.svgContents, snappedMousePosition, snapLines, drawingRef)

	// Render the Engineering Diagram with the proper styling.
	const classes = useStyles()
	options.className = clsx(className, 'FBDInput', classes.FBDInput, options.className, { active })
	return <EngineeringDiagram ref={drawingRef} {...filterOptions(options, defaultEngineeringDiagramOptions)} />
}
export const FBDInput = forwardRef(FBDInputUnforwarded)
export default FBDInput
