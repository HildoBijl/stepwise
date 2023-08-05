import React, { forwardRef } from 'react'
import clsx from 'clsx'

import { processOptions, filterOptions } from 'step-wise/util/objects'

import { DrawingInput, defaultDrawingInputOptions } from 'ui/inputs'

import { clean, functionalize, applySnapping, selectAll, deselectAll, startDrag, getEndDragFunction, endSelect, applyDeletion, showDeleteButton } from '../support'
import * as validation from '../validation'

import FBDInputInner, { defaultFBDInputInnerOptions } from './FBDInputInner'

export const defaultFBDInputOptions = {
	...defaultDrawingInputOptions,
	...defaultFBDInputInnerOptions,

	// Set up default properties for the Input field.
	initialSI: [],
	validate: validation.nonEmptyNoDoubles,
	clean,
	functionalize,

	// Set up default properties specific to the DrawingInput component.
	applySnapping,
	selectAll,
	deselectAll,
	startDrag,
	// endDrag, // This function will be defined based on the given options.
	endSelect,
	applyDeletion,
	showDeleteButton,
}

export const FBDInput = forwardRef((options, drawingRef) => {
	let { endDrag, className } = options = processOptions(options, defaultFBDInputOptions)

	// Set up remaining DrawingInput functions based on the options.
	endDrag = endDrag || getEndDragFunction(options)

	// Put everything into the DrawingInput.
	return <DrawingInput
		ref={drawingRef}
		{...filterOptions(options, defaultDrawingInputOptions)}
		className={clsx('FBDInput', className)}
		endDrag={endDrag}
	>
		<FBDInputInner {...filterOptions(options, defaultFBDInputInnerOptions)} />
	</DrawingInput >
})
FBDInput.validation = validation
export default FBDInput
