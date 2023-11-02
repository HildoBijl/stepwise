import React, { useRef, useCallback, useMemo } from 'react'

import { processOptions, filterOptions, removeEqualProperties, resolveFunctionsShallow, deepEquals } from 'step-wise/util'
import { options as CASOptions, support as CASSupport } from 'step-wise/CAS'

import { useStableCallback } from 'util/react'

import { ResizingInput, defaultResizingInputOptions, resizingInputFunctions } from '../ResizingInput'

import { mouseClickToCursor } from './support'
import { expressionFunctions } from './types'
import { MathInputInner, defaultMathInputInnerOptions } from './MathInputInner'

const { defaultFieldSettings, defaultInterpretationExpressionSettings } = CASOptions
const { getEmpty, isEmpty } = CASSupport

export const mathInputFunctions = resizingInputFunctions

export const defaultMathInputOptions = {
	...defaultResizingInputOptions,
	...defaultMathInputInnerOptions,

	// Apply some default settings.
	label: <>Vul hier het resultaat in</>,
	isEmpty,
	getStartCursor: expressionFunctions.getStartCursor,
	getEndCursor: expressionFunctions.getEndCursor,
	isCursorAtStart: expressionFunctions.isCursorAtStart,
	isCursorAtEnd: expressionFunctions.isCursorAtEnd,
	keyPressToFI: expressionFunctions.keyPressToFI,

	// Adjust the style for Math input.
	autoResize: true, // Resize the field height to the height of the contents (the equation).
	heightDelta: -10, // Equations always have some margin, and we want less for the input field.

	// Add in other options.
	initialValue: getEmpty(),
	settings: {}, // The settings object specifying what is allowed.
}

export function MathInput(options) {
	options = processOptions(options, defaultMathInputOptions)
	const { keyboardSettings, keyPressToFI } = options

	// To position the cursor in the Maths display, we need to track char elements. Set up the ref and update handler.
	const charElementsRef = useRef([])
	const storeCharElements = useCallback(value => { charElementsRef.current = value }, [charElementsRef])

	// Make sure that, when deriving the keyboard settings, the given field settings are known.
	const settings = processOptions(options.settings || {}, defaultFieldSettings)
	options.keyboardSettings = useStableCallback(FI => resolveFunctionsShallow(keyboardSettings, FI, settings))

	// Store the interpretation and expression settings in the SI to have them available upon interpretation.
	const interpretationExpressionSettings = useMemo(() => removeEqualProperties(filterOptions(settings, defaultInterpretationExpressionSettings), defaultInterpretationExpressionSettings), [settings])
	options.initialSettings = interpretationExpressionSettings

	// Also expand the keyPressToFI and the mouseClickToFI with data about the charElements.
	options.keyPressToFI = useStableCallback((keyInfo, FI, contentsElement, cursorElement) => {
		const newFI = keyPressToFI(keyInfo, FI, settings, charElementsRef.current, FI, contentsElement, cursorElement)
		return deepEquals(FI, newFI) ? FI : expressionFunctions.cleanUp(newFI, settings)
	})
	options.mouseClickToFI = useStableCallback((event, FI, contentsElement) => {
		const charElements = charElementsRef.current
		const newFI = { ...FI, cursor: mouseClickToCursor(event, FI, charElements, contentsElement) }
		return deepEquals(FI, newFI) ? FI : expressionFunctions.cleanUp(newFI, settings)
	})

	// Determine the options to pass to the respective parts.
	const resizingInputOptions = {
		...filterOptions(options, defaultResizingInputOptions),
		contextData: {
			...options.contextData,
			charElementsRef,
			storeCharElements,
		},
	}
	const mathInputInnerOptions = filterOptions(options, defaultMathInputInnerOptions)

	// Render the resizing input field.
	return <ResizingInput {...resizingInputOptions}>
		<MathInputInner {...mathInputInnerOptions} />
	</ResizingInput>
}
