import { filterOptions } from 'step-wise/util/objects'
import { resolveFunctions } from 'step-wise/util/functions'

import { getHTMLElement } from 'util/react'

import { useFormParameter, defaultUseFormParameterOptions, useFieldRegistration, defaultFieldRegistrationOptions, useFormPartSettings } from '../../../'

// useReadOnlyValue takes a given readOnly value and also checks the readOnly value provided by the FormPart status. It uses the provided value, or if that's undefined uses the FormPart value.
export function useReadOnlyValue(readOnly) {
	const { readOnly: readOnlyFromFormPart } = useFormPartSettings()
	if (readOnly !== undefined)
		return readOnly
	return readOnlyFromFormPart
}

// useFormRegistration registers the input field to the Form object.
export function useFormRegistration(options) {
	return useFormParameter(filterOptions(options, defaultUseFormParameterOptions))
}

// useFieldControlRegistration registers this field for tabbing at the field controller if needed.
export function useFieldControlRegistration(options, FI) {
	const { allowFocus, readOnly, keyboard, element } = options
	const [active, activateField, deactivateField] = useFieldRegistration({
		...filterOptions(options, defaultFieldRegistrationOptions),
		apply: allowFocus && !readOnly && !!getHTMLElement(element), // Only apply when the element has loaded.
		keyboard: resolveFunctions(keyboard, FI), // The keyboard settings may depend on the input field value.
	})
	return { active, activateField, deactivateField }
}
