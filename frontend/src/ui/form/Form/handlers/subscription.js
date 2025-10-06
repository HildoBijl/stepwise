import { useLatest, useMountedRef, useStableCallback } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests due to Jest using the Node util package instead.

// The subscription handlers track which input fields exist, allows new input fields to subscribe (while providing the right information) and allows dismounting input fields to unsubscribe.
export function useSubscriptionHandlers(initialInput, setInput, fieldsRef) {
	const mountedRef = useMountedRef()
	const initialInputRef = useLatest(initialInput)

	// register makes sure that the input field is known to the form and all its settings are saved. It is instantaneous and saves the options in the Form refs. However, it does not involve a state update.
	const register = useStableCallback((options) => {
		const { id, initialSI } = options

		// If the field is already registered, do nothing.
		if (fieldsRef.current[id])
			return

		// Store the options and save the initialSI in the input.
		fieldsRef.current[id] = {
			...options,
			subscriptions: 0,
			SI: initialSI,
			recentSI: true,
			FO: undefined,
			recentFO: false,
		}
	})

	// subscribe tells the Form that an input field is using an input with the given ID. Multiple input fields can be connected to the same ID. While subscribe is not instantaneous (it is called through an effect) it does update the state.
	const subscribe = useStableCallback(id => {
		setInput(input => {
			// When calling subscribe, the field is required to be registered already.
			if (!fieldsRef.current[id])
				throw new Error(`Invalid field subscription call: tried to subscribe to an input field with ID "${id}" but this field has not been registered yet. Registration must come before subscription.`)

			// Update the subscription count.
			fieldsRef.current[id].subscriptions++

			// If there is an input value, no further actions are needed.
			if (input[id] !== undefined)
				return input

			// There is no input value. We must set up the initial value. If there is a form initial value, override the field's initial value.
			const fieldData = fieldsRef.current[id]
			const formInitialSI = initialInputRef.current && initialInputRef.current[id]
			if (formInitialSI) {
				fieldData.initialSI = formInitialSI
				fieldData.SI = formInitialSI
			}
			return { ...input, [id]: fieldData.functionalize(fieldData.initialSI) }
		})
	})

	// unsubscribe tells the Form that an input field stopped using an input with the given ID. This usually means the field is not on the page anymore (it unmounted).
	const unsubscribe = useStableCallback(id => {
		// Delay calls to unsubscribe, to ensure all subscribe calls are finished.
		setTimeout(() => {
			// When the Form has dismounted, do not do anything anymore.
			if (!mountedRef.current)
				return

			// Based on the subscription numbers, check if the input field needs to be removed. If so, remove it. Use the latest input value to do so.
			setInput(input => {
				const field = fieldsRef.current[id]
				if (field.subscriptions === 1 && !field.persistent) {
					delete fieldsRef.current[id]
					const newInput = { ...input }
					delete newInput[id]
					return newInput
				} else {
					field.subscriptions--
					return input
				}
			})
		}, 0)
	})

	// getFieldData returns the data corresponding to the field with the given ID.
	const getFieldData = useStableCallback(id => {
		if (Array.isArray(id))
			return id.map(id => getFieldData(id))
		return fieldsRef.current[id]
	})

	// getFieldIds returns an array of all field IDs, including those of persistent but removed fields. 
	const getFieldIds = useStableCallback((includeUnsubscribed = false) => {
		const fields = fieldsRef.current
		if (includeUnsubscribed)
			return Object.keys(fields)
		return Object.keys(fields).filter(id => fields[id].subscriptions > 0)
	})

	// Handlers are set up! Return them.
	return { register, subscribe, unsubscribe, getFieldData, getFieldIds }
}
