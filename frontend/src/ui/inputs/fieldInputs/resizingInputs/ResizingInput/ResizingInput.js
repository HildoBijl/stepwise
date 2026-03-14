import React from 'react'

import { mergeDefaults, pickFromDefaults } from '@step-wise/utils'

import { FieldInput, defaultFieldInputOptions } from '../../FieldInput'

import { AbsoluteCursor } from './AbsoluteCursor'
import { ResizingInputInner, defaultResizingInputInnerOptions } from './ResizingInputInner'

export const defaultResizingInputOptions = {
	...defaultFieldInputOptions,
	...defaultResizingInputInnerOptions,
}

export function ResizingInput(options) {
	options = mergeDefaults(options, defaultResizingInputOptions)

	// Determine the options to pass to the respective parts.
	const fieldInputOptions = pickFromDefaults(options, defaultFieldInputOptions)
	const resizingInputInnerOptions = pickFromDefaults(options, defaultResizingInputInnerOptions)

	// Render the field input.
	return <FieldInput {...fieldInputOptions}>
		<AbsoluteCursor />
		<ResizingInputInner {...resizingInputInnerOptions}>
			{options.children}
		</ResizingInputInner>
	</FieldInput>
}
ResizingInput.translatableProps = FieldInput.translatableProps