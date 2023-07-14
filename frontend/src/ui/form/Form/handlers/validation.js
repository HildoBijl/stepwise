import { useLatest, useStableCallback } from 'util/react'

import { useFieldControllerContext } from '../../FieldController'

// The validation handlers compare and evaluate the full form input.
export function useValidationHandlers(validation, setValidation, { getFieldIds, getFieldData, getInputSI, getAllInputSI, getAllInputFO }) {
	const { activateFirst } = useFieldControllerContext()
	const validationRef = useLatest(validation)

	// isInputEqual is used to compare SI objects. It should be given the ID of the field to compare. It is then also given either two SI values (and these are compared) or it is given one, in which case the current SI is compared.
	const isInputEqual = useStableCallback((id, a, b = getInputSI(id)) => {
		const fieldData = getFieldData(id)
		return fieldData && fieldData.equals(a, b)
	})

	// isAllInputEqual is used to compare form SI objects. It is either given two form SI values (and these are compared) or it is given one, in which case the current form SI is compared.
	const isAllInputEqual = useStableCallback((a, b = getAllInputSI()) => {
		// If there is an undefined somewhere, deal with it accordingly.
		if ((a === undefined || b === undefined) && a !== b)
			return false

		// If the keys are not equal, then there is no equality.
		const aKeys = Object.keys(a)
		const bKeys = Object.keys(b)
		if (aKeys.length !== bKeys.length)
			return false

		// Keys are equal. Compare individual fields.
		return aKeys.every(key => isInputEqual(key, a[key], b[key]))
	})

	// isInputValid returns a boolean: are all fields valid? To determine this, it runs all field validation checks. (Unless 'false' is provided: in this case the checks are not run, but the latest result is returned.)
	const isInputValid = useStableCallback((check = true) => {
		// If we do not need to check, return the latest result.
		if (!check)
			return isValidationValid(validationRef.current.result)

		// Get the SIs and the FOs to make sure that all fields are interpreted.
		const inputSI = getAllInputSI()
		const inputFO = getAllInputFO()

		// Walk through the fields and check first interpretation and then validation.
		const result = {}
		getFieldIds().forEach(id => { // Walk through all validation functions and run them.
			const fieldData = getFieldData(id)
			if (fieldData.error) { // On an error in the interpretation get a corresponding message.
				result[id] = fieldData.errorToMessage(fieldData.error)
			} else { // On a correct interpretation run the given validation function.
				const fieldResult = fieldData.validate(inputFO[id], inputFO)
				if (fieldResult)
					result[id] = fieldResult
			}
		})
		setValidation({ result, input: inputSI })

		// All checks are done. Finalize matters.
		activateFirst(Object.keys(result)) // Put the cursor in the first non-valid field.
		return isValidationValid(result)
	})

	// All handlers are set up. Return them!
	return { isInputEqual, isAllInputEqual, isInputValid }
}

// isValidationValid checks whether everything is OK with a given validation result object. Returns a boolean.
function isValidationValid(validationResult) {
	return Object.keys(validationResult).length === 0
}
