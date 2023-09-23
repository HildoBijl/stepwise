import React, { useRef, forwardRef } from 'react'

import { isEmptyObject, processOptions, filterOptions, resolveFunctions, passOn } from 'step-wise/util'

import { useEnsureRef } from 'util/react'

import { Input, defaultInputOptions } from '../../Input'

import { addCursor, removeCursor } from './support'
import { FieldInputHull, defaultFieldInputHullOptions } from './FieldInputHull'

export const defaultFieldInputOptions = {
	// General Input field options.
	...defaultInputOptions,

	// Options for the rendering of the field hull. This also includes the handler functions.
	...defaultFieldInputHullOptions,

	// Make sure to not use the default toSO/toFO clean/functionalize, but simpler versions. 
	clean: passOn,
	functionalize: passOn,

	// Allow various functions to depend on the FI.
	keyPressToFI: undefined,
	keyboardSettings: undefined,

	// Add extra options that allow us to determine the initialSI without having descending components (the specific input fields) worry about the structure of the FI.
	type: undefined,
	initialValue: undefined,
	initialSettings: undefined,
}

export const FieldInput = forwardRef((options, ref) => {
	options = processOptions(options, defaultFieldInputOptions)
	const { type, initialValue, initialSettings, clean, functionalize, keyPressToFI, keyboardSettings } = options
	ref = useEnsureRef(ref)
	const cursorRef = useRef()

	// Process certain functions, given the fact that FieldInput SIs always have the form { type, value, settings } and the FI is identically { type, value, settings, cursor }. (The settings parameter is not always used.) Descendent components (the input fields) then only have to worry about the value.
	options.clean = FI => {
		const result = { ...FI, value: clean ? clean(FI.value, FI.settings) : FI.value }
		if (FI.settings && isEmptyObject(FI.settings))
			delete result.settings
		return removeCursor(result)
	}
	options.functionalize = SI => {
		const result = { ...SI, value: functionalize ? functionalize(SI.value, SI.settings) : SI.value }
		if (initialSettings)
			result.settings = initialSettings
		return addCursor(result, options.getEndCursor(result.value))
	}
	options.initialSI = { type, value: initialValue }
	if (initialSettings && !isEmptyObject(initialSettings))
		options.initialSI.settings = initialSettings

	// Expand the keyPressToFI function to automatically receive the contents element and the cursor element.
	options.keyPressToFI = (keyInfo, FI) => keyPressToFI(keyInfo, FI, ref.current?.contents, cursorRef.current?.element)

	// Define the keyboard set-up (keyFunction and settings together) to be used. This is a function that will take the FI and setFI as input.
	options.keyboard = (FI, setFI) => FI?.cursor !== undefined && keyboardSettings ? {
		keyFunction: (keyInfo) => setFI(FI => options.keyPressToFI(keyInfo, FI)),
		settings: resolveFunctions(keyboardSettings, FI), // keyboardSettings may depend on the FI.
	} : false // When no settings are provided, no keyboard needs to be shown.

	// Set up the Input field settings.
	const inputOptions = {
		...filterOptions(options, defaultInputOptions),
		element: ref.current?.field, // Inform the input field which element it should monitor.
		contextData: { ...options.contextData, inputFieldRef: ref, cursorRef }, // Add the input field ref to the input field context so inner elements can access it.
	}

	// Render the input field and its contents.
	return <Input {...inputOptions}>
		<FieldInputHull ref={ref} {...filterOptions(options, defaultFieldInputHullOptions)}>
			{options.children}
		</FieldInputHull>
	</Input>
})
