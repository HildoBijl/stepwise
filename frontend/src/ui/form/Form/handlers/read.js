import { filterProperties, ensureConsistency, keysToObject } from 'step-wise/util'
import { toFO } from 'step-wise/inputTypes'

import { useLatest, useStableCallback } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests.

// The read handlers allow the extraction of parameters from the Form.
export function useReadHandlers(input, { getFieldData, getFieldIds }) {
	const inputRef = useLatest(input)

	// getInputFI takes a field ID or an array of field IDs and gives the FI value of the given field. If the field value has not been registered yet, it tries to derive it regardless.
	const getInputFI = useStableCallback((id) => {
		if (Array.isArray(id))
			return id.map(id => getInputFI(id))
		if (inputRef.current[id] !== undefined)
			return inputRef.current[id]
		const fieldData = getFieldData(id)
		if (fieldData)
			return fieldData.functionalize(fieldData.initialSI)
	})

	// getAllInputFI gives the FI values of all input fields. When 'true' is passed on, this also includes unsubscribed but persistent fields.
	const getAllInputFI = useStableCallback((includeUnsubscribed = false) => {
		return filterProperties(inputRef.current, getFieldIds(includeUnsubscribed))
	})

	// getInputSI takes a field ID or an array of field IDs and gives the SI value of the given fields.
	const getInputSI = useStableCallback((id) => {
		if (Array.isArray(id))
			return id.map(id => getInputSI(id))
		const FI = getInputFI(id)
		if (FI === undefined)
			return undefined
		const fieldData = getFieldData(id)
		if (!fieldData.recentSI) {
			const newSI = ensureConsistency(fieldData.clean(FI), fieldData.SI)
			if (!fieldData.equals(newSI, fieldData.SI))
				fieldData.recentFO = false // The SI changes, so the FO is not recent anymore. Note this, in case it's requested.
			fieldData.SI = newSI
			fieldData.recentSI = true
		}
		return fieldData.SI
	})

	// getAllInputSI gives the SI values of all input fields. When 'true' is passed on, this also includes unsubscribed but persistent fields.
	const getAllInputSI = useStableCallback((includeUnsubscribed = false) => {
		const fieldIds = getFieldIds(includeUnsubscribed)
		return keysToObject(fieldIds, id => getInputSI(id))
	})

	// getInputFO takes a field ID or an array of field IDs and gives the FO value of the given fields.
	const getInputFO = useStableCallback((id) => {
		if (Array.isArray(id))
			return id.map(id => getInputFO(id))
		const SI = getInputSI(id) // If recentFO is outdated as 'true', this updates it and sets it to 'false'.
		if (SI === undefined)
			return undefined
		const fieldData = getFieldData(id)
		if (!fieldData.recentFO) {
			try {
				delete fieldData.FO // Make sure there is no FO in case interpretation fails.
				delete fieldData.error // Remove a potential previous error.
				fieldData.FO = toFO(SI, true)
				fieldData.recentFO = true
			} catch (error) {
				fieldData.error = error
			}
		}
		return fieldData.FO
	})

	// getAllInputFO gives the FO values of all input fields. When 'true' is passed on, this also includes unsubscribed but persistent fields.
	const getAllInputFO = useStableCallback((includeUnsubscribed = false) => {
		const fieldIds = getFieldIds(includeUnsubscribed)
		return keysToObject(fieldIds, id => getInputFO(id))
	})

	// All handlers are defined! Return them.
	return { getFieldData, getInputFI, getAllInputFI, getInputSI, getAllInputSI, getInputFO, getAllInputFO }
}
