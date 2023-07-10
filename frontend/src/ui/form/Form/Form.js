import React, { useState, useRef } from 'react'

import { isBasicObject, ensureConsistency } from 'step-wise/util/objects'

import { useUpdater } from 'util/react'

import { FormContext } from './context'
import { useSubscriptionHandlers, useReadHandlers, useWriteHandlers, useValidationHandlers } from './handlers'

export default function Form({ children, initialInput }) {
	// Define states.
	const [input, setInput] = useState({})
	const [validation, setValidation] = useState({ result: {}, input: {} })

	// Define refs. These store important data that do not require rerenders.
	const fieldsRef = useRef({})
	const cursorRef = useRef()
	const absoluteCursorRef = useRef()

	// Define important handler functions.
	const { subscribe, unsubscribe, getFieldData, getFieldIds } = useSubscriptionHandlers(initialInput, setInput, fieldsRef)
	const { getInputFI, getAllInputFI, getInputSI, getAllInputSI, getInputFO, getAllInputFO } = useReadHandlers(input, { getFieldData, getFieldIds })
	const { setInputFI, setAllInputSI } = useWriteHandlers(setInput, { getFieldData })
	const { isInputEqual, isInputValid } = useValidationHandlers(validation, setValidation, { getFieldIds, getFieldData, getAllInputSI, getAllInputFO })

	// Upon a change of the initialInput, try to implement it.
	useInitialInputUpdating()

	// Set up the Form context for everyone to use.
	return (
		<FormContext.Provider value={{ input, validation, cursorRef, absoluteCursorRef, subscribe, unsubscribe, getFieldData, getFieldIds, getInputFI, getAllInputFI, getInputSI, getAllInputSI, getInputFO, getAllInputFO, setInputFI, setAllInputSI, isInputEqual, isInputValid }}>
			<form onSubmit={(evt) => evt.preventDefault()}>
				{children}
			</form>
		</FormContext.Provider>
	)
}

// useInitialInputUpdating is an effect that is triggered on a change in the initialValue parameter. When this parameter changes, we attempt to implement the new value.
function useInitialInputUpdating(initialInput, setInput, getFieldData) {
	useUpdater(() => {
		// Check the initial input.
		if (initialInput === undefined)
			return
		if (!isBasicObject(initialInput))
			throw new Error(`Invalid initial Form input: received an initialInput parameter for a Form but it was of type "${typeof initialInput}". A basic object with various parameters was expected.`)

		// Attempt to apply each parameter given in the initial input.
		setInput(input => {
			const newInput = { ...input }
			Object.keys(initialInput).forEach(id => {
				// When the field does not exist, do not apply the new initial input value.
				const fieldData = getFieldData(id)
				if (fieldData === undefined)
					return

				// When the user already changed the input, do not apply the new initial input.
				const currentFI = input[id]
				const currentSI = fieldData.clean(currentFI)
				if (!fieldData.equals(currentSI, fieldData.initialSI))
					return

				// Apply the new initial input.
				newInput[id] = fieldData.functionalize(initialInput[id])
				fieldData.SI = initialInput[id]
				fieldData.recentSI = true
				fieldData.recentFO = false
			})
			return ensureConsistency(newInput, input)
		})
	}, [initialInput])
}
