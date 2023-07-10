import { useLatest, useMountedRef, useStableCallback } from 'util/react'

// The subscription handlers track which input fields exist, allows new input fields to subscribe (while providing the right information) and allows dismounting input fields to unsubscribe.
export function useSubscriptionHandlers(initialInput, setInput, fieldsRef) {
	const mountedRef = useMountedRef()
	const initialInputRef = useLatest(initialInput)

	// subscribe tells the Form that an input field is using an input with the given ID. Multiple input fields can be connected to the same ID.
	const subscribe = useStableCallback((options) => {
		setInput(input => {
			let { id, initialSI, functionalize } = options

			// On an existing field, keep the input and simply update subscription numbers.
			if (input[id] !== undefined) {
				fieldsRef.current[id].subscriptions++
				return input
			}

			// On a non-existing field, determine the initial value. A given value to the form overrides the initial value specified by the field.
			const initialFieldInput = initialInputRef.current && initialInputRef.current[id]
			if (initialFieldInput !== undefined)
				initialSI = initialFieldInput

			// Store the options and save the initialFI in the input.
			fieldsRef.current[id] = {
				...options,
				subscriptions: 1,
				SI: initialSI,
				recentSI: true,
				FO: undefined,
				recentFO: false,
			}
			return { ...input, [id]: functionalize(initialSI) }
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
	return { subscribe, unsubscribe, getFieldData, getFieldIds }
}
