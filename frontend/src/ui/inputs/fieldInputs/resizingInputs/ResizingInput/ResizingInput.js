import React from 'react'

import { normalizeOptions, filterOptions } from 'step-wise/util'

import { FieldInput, defaultFieldInputOptions } from '../../FieldInput'

import { AbsoluteCursor } from './AbsoluteCursor'
import { ResizingInputInner, defaultResizingInputInnerOptions } from './ResizingInputInner'

export const defaultResizingInputOptions = {
	...defaultFieldInputOptions,
	...defaultResizingInputInnerOptions,
}

export function ResizingInput(options) {
	options = normalizeOptions(options, defaultResizingInputOptions)

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
ResizingInput.translatableProps = FieldInput.translatableProps