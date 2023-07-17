import { ensureString } from 'step-wise/util/strings'
import { processOptions } from 'step-wise/util/objects'

import { defaultFieldRegistrationOptions, defaultUseFormParameterOptions } from '../../'

import { InputContext } from './context'
import { useReadOnlyValue, useFormRegistration, useFieldControlRegistration } from './handlers'

export const defaultInputOptions = {
	children: null, // Contents inside the input field.
	readOnly: undefined, // When not given, this is deduced from the FormPart status.
	contextData: {}, // Other data that needs to be added to the context.

	// For registration in the form.
	...defaultUseFormParameterOptions,

	// For focus and tabbing.
	...defaultFieldRegistrationOptions,
	allowFocus: true,
}

export default function Input(options) {
	// Process and extract the given options.
	options = processOptions(options, defaultInputOptions)
	let { id, children, readOnly, contextData } = options
	id = ensureValidInputId(id)
	readOnly = useReadOnlyValue(readOnly)
	options = { ...options, readOnly }

	// Use handlers to register the input field in the right places.
	const [FI, setFI] = useFormRegistration({ ...options, readOnly })
	const fieldControlRegistration = useFieldControlRegistration({ ...options, readOnly }, FI)

	// Set up the Input context for child components to use.
	return (
		<InputContext.Provider value={{ id, readOnly, FI, setFI, ...fieldControlRegistration, ...contextData }}>
			{children}
		</InputContext.Provider>
	)
}

// ensureValidInputId verifies that the given input field ID is allowed. If not, it throws an error.
const bannedInputIds = ['id', 'type', 'value', 'cursor', 'SO']
function ensureValidInputId(id) {
	id = ensureString(id)
	if (bannedInputIds.includes(id))
		throw new Error(`Disallowed input ID used: the ID "${id}" is a reserved keyword and is not allowed as an ID for an input field.`)
	return id
}
