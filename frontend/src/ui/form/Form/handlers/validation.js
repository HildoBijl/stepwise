import { useLatestRef, useStableCallback } from '@step-wise/react-utils'

import { useFieldControllerContext } from '../../FieldController'

// The validation handlers compare and evaluate the full form input.
export function useValidationHandlers(validation, setValidation, { getFieldIds, getFieldIdsForPart, getFieldData, getInputSI, getAllInputSI, getAllInputFO }) {
	const { activateFirst } = useFieldControllerContext()
	const validationRef = useLatestRef(validation)

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
		return bKeys.every(key => isInputEqual(key, a[key], b[key]))
	})

	// validateFields checks the requested fields. All form values remain available to cross-field validation functions.
	const validateFields = useStableCallback(fieldIds => {
		const inputSI = getAllInputSI()
		const inputFO = getAllInputFO()
		const result = {}
		fieldIds.forEach(id => {
			const fieldData = getFieldData(id)
			if (fieldData.error) {
				result[id] = fieldData.errorToMessage(fieldData.error)
			} else {
				const fieldResult = fieldData.validate(inputFO[id], inputFO)
				if (fieldResult)
					result[id] = fieldResult
			}
		})
		setValidation({ result, input: inputSI })
		activateFirst(Object.keys(result))
		return isValidationValid(result)
	})

	// isInputValid returns whether all active fields are valid. Passing false returns the latest result without checking again.
	const isInputValid = useStableCallback((check = true) => {
		if (!check)
			return isValidationValid(validationRef.current.result)
		return validateFields(getFieldIds())
	})

	// isPartInputValid validates only the active fields belonging to the given form part.
	const isPartInputValid = useStableCallback(part => validateFields(getFieldIdsForPart(part)))

	// All handlers are set up. Return them!
	return { isInputEqual, isAllInputEqual, isInputValid, isPartInputValid }
}

// isValidationValid checks whether everything is OK with a given validation result object. Returns a boolean.
function isValidationValid(validationResult) {
	return Object.keys(validationResult).length === 0
}
