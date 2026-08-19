import { resolveFunctionValuesDeep } from '@step-wise/js-utils'

import { useStableCallback } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests due to Jest using the Node util package instead.

// The write handlers allow the adjusting of Form parameters.
export function useWriteHandlers(setInput, { getFieldData }) {
	// setInputFI saves the given FI for the given field ID. Note that only FIs can be saved, and not SIs or FOs.
	const setInputFI = useStableCallback((id, FI) => {
		setInput(input => {
			// Get the FI. If the FI is not in the state yet (like on an initial render) then determine it from the fieldData.
			const fieldData = getFieldData(id)
			let oldFI = input[id]
			if (oldFI === undefined)
				oldFI = fieldData.functionalize(fieldData.initialSI)

			// Allow for functions in the new FI that take into account the old FI.
			FI = resolveFunctionValuesDeep(FI, oldFI)

			// Functional input may contain domain objects. Its updater must preserve the existing reference itself when no change is needed.
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
			let newInput = input
			Object.keys(inputSI).forEach(id => {
				const fieldData = getFieldData(id)
				if (!fieldData)
					return

				// Stored input has field-specific equality and contains no functional objects. Keep the existing FI when its corresponding SI is unchanged.
				if (!fieldData.equals(inputSI[id], fieldData.SI))
					newInput = { ...newInput, [id]: fieldData.functionalize(inputSI[id]) }
				fieldData.SI = inputSI[id]
				fieldData.recentSI = true
				fieldData.recentFO = false
			})
			return newInput
		})
	})

	// All the handlers are set up. Return them!
	return { setInputFI, setAllInputSI }
}
