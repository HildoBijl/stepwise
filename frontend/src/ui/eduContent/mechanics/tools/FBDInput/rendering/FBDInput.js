import React, { forwardRef } from 'react'
import clsx from 'clsx'

import { mergeDefaults, pickFromDefaults } from '@step-wise/js-utils'

import { DrawingInput, defaultDrawingInputOptions } from 'ui/inputs'

import { FreeBodyDiagramType, clean, functionalize, equals, applySnapping, selectAll, deselectAll, startDrag, getEndDragFunction, getEndSelectFunction, applyDeletion, showDeleteButton } from '../support'
import * as validation from '../validation'

import FBDInputInner, { defaultFBDInputInnerOptions } from './FBDInputInner'

export const defaultFBDInputOptions = {
	...defaultDrawingInputOptions,
	...defaultFBDInputInnerOptions,

	// Set up default properties for the Input field.
	initialSI: { type: FreeBodyDiagramType, value: [] },
	validate: validation.nonEmptyNoDoubles,
	clean,
	functionalize,
	equals,

	// Set up default properties specific to the DrawingInput component.
	applySnapping,
	selectAll,
	deselectAll,
	startDrag,
	// endDrag, // This function will be defined based on the given options.
	// endSelect is defined from the transformation settings below.
	applyDeletion,
	showDeleteButton,
}

export const FBDInput = forwardRef((options, drawingRef) => {
	let { endDrag, endSelect, className } = options = mergeDefaults(options, defaultFBDInputOptions)

	// Set up remaining DrawingInput functions based on the options.
	endDrag = endDrag || getEndDragFunction(options)
	endSelect = endSelect || getEndSelectFunction(options)

	// Put everything into the DrawingInput.
	return <DrawingInput
		ref={drawingRef}
		{...pickFromDefaults(options, defaultDrawingInputOptions)}
		className={clsx('FBDInput', className)}
		endDrag={endDrag}
		endSelect={endSelect}
	>
		<FBDInputInner {...pickFromDefaults(options, defaultFBDInputInnerOptions)} />
	</DrawingInput >
})
FBDInput.validation = validation
export default FBDInput
