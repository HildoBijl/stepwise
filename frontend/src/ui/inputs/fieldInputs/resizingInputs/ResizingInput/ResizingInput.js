import React from 'react'

import { processOptions, filterOptions } from 'step-wise/util'

import { FieldInput, defaultFieldInputOptions, fieldInputFunctions } from '../../FieldInput'

import { AbsoluteCursor } from './AbsoluteCursor'
import { ResizingInputInner, defaultResizingInputInnerOptions } from './ResizingInputInner'

export const resizingInputFunctions = fieldInputFunctions

export const defaultResizingInputOptions = {
	...defaultFieldInputOptions,
	...defaultResizingInputInnerOptions,
}

export function ResizingInput(options) {
	options = processOptions(options, defaultResizingInputOptions)

	// Determine the options to pass to the respective parts.
	const fieldInputOptions = filterOptions(options, defaultFieldInputOptions)
	const resizingInputInnerOptions = filterOptions(options, defaultResizingInputInnerOptions)

	// Render the field input.
	return <FieldInput {...fieldInputOptions}>
		<AbsoluteCursor />
		<ResizingInputInner {...resizingInputInnerOptions}>
			{options.children}
		</ResizingInputInner>
	</FieldInput>
}
