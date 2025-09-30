import { ensureConsistency, resolveFunctions } from 'step-wise/util'

import { useStableCallback } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests due to Jest using the Node util package instead.

// The write handlers allow the adjusting of Form parameters.
export function useWriteHandlers(setInput, { getFieldData }) {
	// setInputFI saves the given FI for the given field ID. Note that only FIs can be saved, and not SIs or FOs.
	const setInputFI = useStableCallback((id, FI) => {
		setInput((input) => {
			// Get the FI. If the FI is not in the state yet (like on an initial render) then determine it from the fieldData.
			const fieldData = getFieldData(id)
			let oldFI = input[id]
			if (oldFI === undefined)
				oldFI = fieldData.functionalize(fieldData.initialSI)

			// Allow for functions in the new FI that take into account the old FI.
			FI = ensureConsistency(FI, oldFI)

			// On a non-change, keep the old input.
			FI = resolveFunctions(FI, oldFI)
			if (FI === oldFI)
				return input

			// Apply the parameter into the input.
			fieldData.recentSI = false // The input changed. The SI is probably not valid.
			return { ...input, [id]: FI }
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
