import React, { useRef } from 'react'

import { processOptions, filterOptions, resolveFunctions } from 'step-wise/util'

import { Input, defaultInputOptions } from '../Input'

import { addCursor, removeCursor } from './support'
import { FieldInputHull, defaultFieldInputHullOptions } from './FieldInputHull'

export const defaultFieldInputOptions = {
	// General Input field options.
	...defaultInputOptions,

	// Options for the rendering of the field hull. This also includes the handler functions.
	...defaultFieldInputHullOptions,

	// Add extra options that allow us to determine the initialSI without having descending components (the specific input fields) worry about the structure of the FI.
	type: undefined,
	initialValue: undefined,
}

export function FieldInput(options) {
	options = processOptions(options, defaultFieldInputOptions)
	const hullRef = useRef()

	// Process certain functions, given the fact that FieldInput SIs always have the form { type, value } and the FI is identically { type, value, cursor }. Descendent components (the input fields) then only have to worry about the value.
	const { type, initialValue, clean, functionalize } = options
	options.clean = FI => removeCursor({
		...FI,
		value: clean ? clean(FI.value) : FI.value,
	})
	options.functionalize = SI => {
		const value = functionalize ? functionalize(SI.value) : SI.value
		return addCursor({ ...SI, value }, options.getEndCursor(value))
	}
	options.initialSI = { type, value: initialValue }

	// Define the keyboard set-up (keyFunction and settings together) to be used. This is here a function that will take the FI and setFI as input. It will be evaluated internally.
	const { keyPressToFI, keyboardSettings } = options
	options.keyboard = (FI, setFI) => FI?.cursor !== undefined && keyboardSettings ? {
		keyFunction: (keyInfo) => setFI(FI => keyPressToFI(keyInfo, FI, hullRef.current?.contents)),
		settings: resolveFunctions(keyboardSettings, FI), // keyboardSettings may depend on the FI.
	} : false // When no settings are provided, no keyboard needs to be shown.

	// Set up the Input field settings.
	const inputOptions = {
		...filterOptions(options, defaultInputOptions),
		element: hullRef.current?.field, // Inform the input field which element it should monitor.
	}

	// Render the input field and its contents.
	return <Input {...inputOptions}>
		<FieldInputHull ref={hullRef} {...filterOptions(options, defaultFieldInputHullOptions)}>
			{options.children}
		</FieldInputHull>
	</Input>
}
