import React, { useState, useRef } from 'react'

import { isBasicObject, ensureConsistency } from 'step-wise/util'

import { useUpdater, useLatest } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests due to Jest using the Node util package instead.

import { FormContext } from './context'
import { useSubscriptionHandlers, useReadHandlers, useWriteHandlers, useValidationHandlers } from './handlers'

export function Form({ children, initialInput, submit }) {
	// Define states.
	const [input, setInput] = useState({})
	const [validation, setValidation] = useState({ result: {}, input: {} })

	// Define refs. These store important data that do not require rerenders.
	const fieldsRef = useRef({}) // Stores all subscribed fields, processed versions of their input, and whether these data points are valid.
	const submitRef = useLatest(submit) // Stores the submit function.

	// Define handler functions.
	const subscriptionHandlers = useSubscriptionHandlers(initialInput, setInput, fieldsRef)
	const readHandlers = useReadHandlers(input, subscriptionHandlers)
	const writeHandlers = useWriteHandlers(setInput, subscriptionHandlers)
	const validationHandlers = useValidationHandlers(validation, setValidation, { ...subscriptionHandlers, ...readHandlers })

	// Upon a change of the initialInput, try to implement it.
	useInitialInputUpdating()

	// Set up the Form context for everyone to use.
	return (
		<FormContext.Provider value={{
			input, validation, // State
			submitRef,
			...subscriptionHandlers,
			...readHandlers,
			...writeHandlers,
			...validationHandlers,
		}}>
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
