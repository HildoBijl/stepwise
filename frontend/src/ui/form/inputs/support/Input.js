// This Input file contains supporting functions for all input field types, including field inputs (which can be typed in) and drawing inputs (which should be drawed upon).

import { ensureString } from 'step-wise/util/strings'
import { filterOptions, processOptions } from 'step-wise/util/objects'
import { resolveFunctions } from 'step-wise/util/functions'

import { getHTMLElement } from 'util/react'
import { useFormPartSettings } from 'ui/form/FormPart'
import { useFormParameter, defaultUseFormParameterOptions } from 'ui/form/Form'
import { useFieldRegistration, defaultFieldControlOptions } from 'ui/form/FieldController'
import { useFieldFeedback, defaultFieldFeedbackOptions } from 'ui/form/FeedbackProvider'

const bannedInputIds = ['id', 'type', 'value', 'cursor', 'SO']

/* useAsInput can be used inside an input field and does various things.
 * - Extract the status of this input field from the Status context.
 * - Connecting it to the Form for input data storage.
 * - Register the field for tabbing at the FieldController.
 * - Asking the FeedbackProvider for relevant feedback.
 * All the settings are merged into one big object, both for the input and the output.
 */
export function useAsInput(options) {
	options = processOptions(options, defaultInputOptions)

	// Process and check basic properties.
	let { id } = options
	id = ensureString(id)
	if (bannedInputIds.includes(id))
		throw new Error(`Disallowed input ID used: the ID "${id}" is a reserved keyword and is not allowed as an ID for an input field.`)

	// Find the status of the Exercise block: are we done with this part of the exercise? Based on this, determine if we should make it read-only.
	let { readOnly } = options
	const { readOnly: readOnlySetting } = useFormPartSettings()
	readOnly = (readOnly === undefined ? readOnlySetting : readOnly) // If read-only is manually specified, use that instead.

	// Connect to the Form for input data storage.
	const [FI, setFI] = useFormParameter(filterOptions(options, defaultUseFormParameterOptions))

	// Register the field for tabbing at the field controller.
	const { useFocusRegistration, keyboard } = options
	const [active, activateField, deactivateField] = useFieldRegistration({
		...filterOptions(options, defaultFieldControlOptions),
		apply: useFocusRegistration && !readOnly && !!getHTMLElement(options.element), // Only apply when the element has loaded.
		keyboard: resolveFunctions(keyboard, FI), // The keyboard settings may depend on the data.
	})

	// Get feedback from the Feedback Provider.
	const { feedback, feedbackInput } = useFieldFeedback(filterOptions(options, defaultFieldFeedbackOptions))

	// Return all data as one large object.
	return { id, readOnly, FI, setFI, active, activateField, deactivateField, feedback, feedbackInput }
}
export const defaultInputOptions = {
	// General.
	id: undefined,

	// Status-dependent.
	readOnly: undefined,

	// For Form data registration.
	...defaultUseFormParameterOptions,

	// For focus and tabbing.
	useFocusRegistration: true,
	element: undefined,
	autofocus: undefined,
	keyboard: undefined,
	focusOnClick: undefined,

	// For feedback.
	...defaultFieldFeedbackOptions,
}