import React, { forwardRef, useState } from 'react'

import { processOptions, filterOptions } from 'step-wise/util'

import { useEnsureRef } from 'util'

import { Input, defaultInputOptions } from '../../../Input'

import { applySelectingOptions } from '../draggingAndSelecting'

import { DrawingInputHull, defaultDrawingInputHullOptions } from './DrawingInputHull'

export const defaultDrawingInputOptions = {
	...defaultInputOptions,
	...defaultDrawingInputHullOptions,
}

// The DrawingInput wrapper wraps a Drawing into an Input object for Input functionalities. It forwards the Ref to the Drawing element.
export const DrawingInput = forwardRef((options, drawingRef) => {
	options = processOptions(options, defaultDrawingInputOptions)
	drawingRef = useEnsureRef(drawingRef)

	// Set up a state to control the cursor style.
	const [cursor, setCursor] = useState()

	// Set up the Input field settings.
	const inputOptions = {
		...filterOptions(options, defaultInputOptions),
		element: drawingRef.current?.figure?.inner, // Inform the input field which element should monitor clicks/focusing.
		contextData: { // Add extra data to the context.
			...options.contextData,
			drawingRef, // So elements inside can access the Drawing. (Although a Drawing component also has its own context.)
			inDrawingInput: true, // To note that we're in a DrawingInput. Some elements need this to determine the current background color.
			cursor, setCursor, // To define the cursor of the drawing input.
		},
	}

	// Render the field.
	return <Input {...inputOptions}>
		<DrawingInputHull ref={drawingRef} {...filterOptions(options, defaultDrawingInputHullOptions)} />
	</Input>
})
DrawingInput.applySelectingOptions = applySelectingOptions
