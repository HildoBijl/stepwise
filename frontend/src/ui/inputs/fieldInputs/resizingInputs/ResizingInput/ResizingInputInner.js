import { processOptions } from 'step-wise/util'

import { useInputData } from '../../../Input'

import { useFieldResizing } from './handlers'

export const defaultResizingInputInnerOptions = {
	autoResize: true,
	heightDelta: 0,
	children: null,
}

export function ResizingInputInner(options) {
	const { autoResize, heightDelta } = processOptions(options, defaultResizingInputInnerOptions)
	const { FI, inputFieldRef } = useInputData()

	// Ensure that the field resizes along with the contents.
	useFieldResizing(inputFieldRef, FI.value, autoResize, heightDelta)

	// Render the contents. There is nothing extra added to this. We just need to be inside the Input context.
	return options.children
}
