// The FBDInput is an input field for Free Body Diagrams. It takes 

import React, { forwardRef, useRef, useImperativeHandle } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import { alpha } from '@material-ui/core/styles/colorManipulator'

import { ensureString } from 'step-wise/util/strings'
import { processOptions, filterOptions } from 'step-wise/util/objects'
import { noop } from 'step-wise/util/functions'

import { useRefWithValue, useEventListener, useMousePositionRelative } from 'util/react'
import { useFieldRegistration } from 'ui/form/FieldController'
import { useDrawingMousePosition } from 'ui/components/figures/Drawing'

import EngineeringDiagram, { defaultOptions as engineeringDiagramDefaultOptions, Hinge, Force } from './EngineeringDiagram'

export const defaultOptions = {
	...engineeringDiagramDefaultOptions,
	id: undefined,
	initialValue: {},
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
			transition: `background ${theme.transitions.duration.standard}ms`,
		},
		'&.active .figureInner, & .figureInner:hover': {
			background: alpha(theme.palette.primary.main, 0.05),
		},
	},
}))

function FBDInputUnforwarded(options, ref) {
	// Check input.
	options = processOptions(options, defaultOptions)
	let { id, initialValue, readOnly, autofocus, persistent, validate } = options
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
	useEventListener('click', (evt) => figureInnerRef.current.contains(evt.target) ? activateField() : deactivateField())

	// Track the mouse position.
	const mousePosition = useDrawingMousePosition(diagramRef)
	if (diagram && diagram.isInside(mousePosition)) {
		options.parts = <>
			{options.parts}
			<Force points={{ vector: [50, 50], end: mousePosition }} />
		</>
	}

	// Connect to the form to control the input data.
	// const [data, setData] = useFormParameter(id, { initialValue, subscribe: true, persistent })

	// Arrange proper styling.
	const classes = useStyles()
	options.className = clsx('FBDInput', classes.FBDInput, options.className, { active })

	// Render the Engineering Diagram with the added functionalities.
	return <EngineeringDiagram ref={diagramRef} {...filterOptions(options, engineeringDiagramDefaultOptions)} />
}
export const FBDInput = forwardRef(FBDInputUnforwarded)
export default FBDInput