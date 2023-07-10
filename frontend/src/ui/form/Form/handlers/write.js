import { ensureConsistency } from 'step-wise/util/objects'
import { resolveFunctions } from 'step-wise/util/functions'

import { useStableCallback } from 'util/react'

// The write handlers allow the adjusting of Form parameters.
export function useWriteHandlers(setInput, { getFieldData }) {
	// setInputFI saves the given FI for the given field ID. Note that only FIs can be saved, and not SIs or FOs.
	const setInputFI = useStableCallback((id, FI) => {
		setInput((input) => {
			const oldFI = input[id]
			FI = resolveFunctions(FI, oldFI) // Allow for functions in the new FI that take into account the old FI.
			FI = ensureConsistency(FI, oldFI)
			if (FI === oldFI)
				return input // On a non-change, keep the old input.
			const fieldData = getFieldData(id)
			fieldData.recentSI = false // The input changed. The SI is probably not valid.
			return { ...input, [id]: FI } // Set up the new input.
		})
	})

	// setAllInputSI can overwrite the entire content of the form with a given form SI object.
	const setAllInputSI = useStableCallback(inputSI => {
		setInput(input => {
			const newInput = { ...input }
			Object.keys(inputSI).forEach(id => {
				const fieldData = getFieldData(id)
				if (fieldData === undefined)
					return // When the field does not exist, do not apply the new input value.
				newInput[id] = fieldData.functionalize(inputSI[id])
				fieldData.SI = inputSI[id]
				fieldData.recentSI = true
				fieldData.recentFO = false
			})
			return ensureConsistency(newInput, input)
		})
	})

	// All the handlers are set up. Return them!
	return { setInputFI, setAllInputSI }
}
