// The FBDInput is an input field for Free Body Diagrams. It takes 

import React, { forwardRef, useRef, useState, useImperativeHandle } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import { alpha } from '@material-ui/core/styles/colorManipulator'

import { ensureString } from 'step-wise/util/strings'
import { processOptions, filterOptions } from 'step-wise/util/objects'
import { noop } from 'step-wise/util/functions'
import { Vector } from 'step-wise/CAS/linearAlgebra/Vector'

import { getEventPosition } from 'util/dom'
import { useRefWithValue, useEventListener } from 'util/react'
import { useFormParameter } from 'ui/form/Form'
import { useFieldRegistration } from 'ui/form/FieldController'
import { useFieldFeedback } from 'ui/form/FeedbackProvider'
import { useDrawingMousePosition } from 'ui/components/figures/Drawing'
import { notSelectable } from 'ui/theme'

import EngineeringDiagram, { defaultOptions as engineeringDiagramDefaultOptions, Force } from './EngineeringDiagram'

export const defaultOptions = {
	...engineeringDiagramDefaultOptions,
	id: undefined,
	initialValue: { forces: [], moments: [] }, // ToDo: put this initial FBD value in a central place.
	readOnly: undefined,
	autofocus: false,
	persistent: false,
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
	// Check input.
	options = processOptions(options, defaultOptions)
	let { id, initialValue, readOnly, autofocus, persistent, validate } = processOptions(options, defaultOptions)
	id = ensureString(id, true)

	// Sort out the various references.
	const diagramRef = useRef() // Reference from here to the diagram.
	const diagram = diagramRef && diagramRef.current
	useImperativeHandle(ref, () => diagramRef.current) // Reference from here passed on to children.
	const figureInner = diagramRef.current && diagramRef.current.figure && diagramRef.current.figure.inner
	const figureInnerRef = useRefWithValue(figureInner) // Reference to the DOM element, needed for field registration.

	// Determine the status of this input field.
	// const { done } = useStatus()
	// readOnly = (readOnly === undefined ? done : readOnly)

	// Register the field for activation (tabbing and clicking).
	const apply = figureInnerRef.current && !readOnly // Only apply field registration once the figure has loaded.
	const [active, activateField, deactivateField] = useFieldRegistration({ id, ref: figureInnerRef, apply, autofocus })
	useEventListener('mousedown', (evt) => figureInnerRef.current.contains(evt.target) ? activateField() : deactivateField())

	// Connect to the form to control the input data.
	const [data, setData] = useFormParameter(id, { initialValue, subscribe: true, persistent })
	const { feedback } = useFieldFeedback({ fieldId: id, validate })

	// Track the mouse position. On a mouse down start dragging, and on a mouse up end it.
	const mousePosition = useDrawingMousePosition(diagramRef)
	const [mouseDownPosition, setMouseDownPosition] = useState()
	const startDrawing = (evt) => {
		if (!apply)
			return
		if (mouseDownPosition)
			return setMouseDownPosition(undefined) // Second touch! Cancel drawing to prevent confusion.
		setMouseDownPosition(diagramRef.current.getPosition(getEventPosition(evt)))
	}
	const endDrawing = (evt) => {
		if (mouseDownPosition) {
			const finalPosition = diagramRef.current.getPosition(getEventPosition(evt)) || mousePosition
			if (finalPosition)
				setData(data => ({ ...data, forces: [...data.forces, { start: mouseDownPosition, end: mousePosition }] }))
		}
		setMouseDownPosition(undefined)
	}
	useEventListener('mousedown', startDrawing, figureInner)
	useEventListener('touchstart', startDrawing, figureInner)
	useEventListener('mouseup', endDrawing)
	useEventListener('touchend', endDrawing)

	if (diagram) {
		options.svgContents = <>
			{options.svgContents}
			{data.forces.map((force, index) => <Force key={index} points={force} />)}
			{mousePosition && mouseDownPosition ? <Force points={{ start: mouseDownPosition, end: mousePosition }} /> : null}
		</>
	}

	// Render the Engineering Diagram with the proper styling.
	const classes = useStyles()
	options.className = clsx('FBDInput', classes.FBDInput, options.className, { active })
	return <EngineeringDiagram ref={diagramRef} {...filterOptions(options, engineeringDiagramDefaultOptions)} />
}
export const FBDInput = forwardRef(FBDInputUnforwarded)
export default FBDInput