import React, { createContext, useState, useContext, useRef, useCallback, useEffect } from 'react'

import { processOptions, deepEquals, ensureConsistency, applyToEachParameter } from 'step-wise/util/objects'
import { passOn } from 'step-wise/util/functions'
import { toFO } from 'step-wise/inputTypes'
import { getLastInput } from 'step-wise/edu/exercises/util/simpleExercise'

import { useRefWithValue, useMountedRef } from 'util/react'
import { useExerciseData } from 'ui/edu/exercises/ExerciseContainer'

import { useFieldControllerContext } from './FieldController'

const FormContext = createContext(null)

export default function Form({ children }) {
	// Define states.
	const [input, setInput] = useState({})
	const [, setSubscriptions] = useState({})
	const [validation, setValidation] = useState({})
	const [validationInput, setValidationInput] = useState({})

	// Define refs. We use refs along with state parameters to allow callback functions to remain constant.
	const validationFunctionsRef = useRef({})
	const cleanFunctionsRef = useRefWithValue({})
	const inputRef = useRefWithValue(input)
	const validationRef = useRefWithValue(validation)
	const cursorRef = useRef()
	const absoluteCursorRef = useRef()

	// Get other parameters.
	const { activateFirst } = useFieldControllerContext()
	const mountedRef = useMountedRef()

	// Define input parameter handlers.
	const setParameter = useCallback((id, data) => {
		setInput((input) => {
			const oldData = input[id]
			const newData = typeof data === 'function' ? data(oldData) : data
			return {
				...input,
				[id]: ensureConsistency(newData, oldData),
			}
		})
	}, [setInput])

	const deleteParameter = useCallback((id) => {
		setInput((input) => {
			const newInput = { ...input }
			delete newInput[id]
			return newInput
		})
	}, [setInput])

	const subscribe = useCallback((id, initialData) => {
		setSubscriptions(subscriptions => ({ ...subscriptions, [id]: (subscriptions[id] || 0) + 1 }))
		if (initialData !== undefined) {
			setInput((input) => {
				if (input[id] !== undefined)
					return input
				return { ...input, [id]: (typeof initialData === 'function' ? initialData() : initialData) }
			})
		}
	}, [setSubscriptions, setInput])

	const unsubscribe = useCallback((id, persistent = false) => {
		setTimeout(() => { // Delay calls to unsubscribe, to ensure all subscribe calls are finished.
			if (!mountedRef.current)
				return // Prevent calls when we have unmounted in the meantime.
			setSubscriptions((subscriptions) => {
				subscriptions = { ...subscriptions }
				if (subscriptions[id] === 1 && !persistent) {
					delete subscriptions[id]
					deleteParameter(id)
				} else {
					subscriptions[id]--
				}
				return subscriptions
			})
		}, 0)
	}, [mountedRef, setSubscriptions, deleteParameter])

	const setParameters = useCallback((newInput, override = false) => {
		setInput((input) => (override ? { ...newInput } : { ...input, ...newInput }))
	}, [])

	const clearForm = useCallback(() => setInput({}), [])

	// Define the cleaning set-up, allowing functional input (FI) parameters to be turned into stored input (SI) parameters.
	const saveCleanFunction = useCallback((id, clean) => {
		if (clean)
			cleanFunctionsRef.current[id] = clean
		else
			delete cleanFunctionsRef.current[id]
	}, [cleanFunctionsRef])

	const getCleanInput = useCallback(() => {
		return applyToEachParameter(inputRef.current, (input, id) => {
			const clean = cleanFunctionsRef.current[id]
			return input !== undefined && clean ? clean(input) : input
		})
	}, [inputRef, cleanFunctionsRef])

	const getCleanInputParameter = useCallback((id) => {
		const input = inputRef.current[id]
		const clean = cleanFunctionsRef.current[id]
		return input !== undefined && clean ? clean(input) : input
	}, [inputRef, cleanFunctionsRef])

	// Define validation handlers.
	const isValid = useCallback((check = true) => {
		if (!check)
			return isValidationValid(validationRef.current)
		const validation = {}
		const input = getCleanInput()
		Object.keys(validationFunctionsRef.current).forEach(id => {
			const validate = validationFunctionsRef.current[id]
			const result = validate(input)
			if (result)
				validation[id] = result
		})
		setValidation(validation)
		setValidationInput(input)
		activateFirst(Object.keys(validation)) // Put the cursor in the first non-valid field.
		return isValidationValid(validation)
	}, [getCleanInput, validationRef, validationFunctionsRef, setValidation, activateFirst])

	const saveValidationFunction = useCallback((id, validate) => {
		if (validate)
			validationFunctionsRef.current[id] = validate
		else
			delete validationFunctionsRef.current[id]
	}, [validationFunctionsRef])

	return (
		<FormContext.Provider value={{ input, setParameter, deleteParameter, subscribe, unsubscribe, setParameters, clearForm, validation, validationInput, isValid, saveValidationFunction, cursorRef, absoluteCursorRef, saveCleanFunction, getCleanInput, getCleanInputParameter }}>
			<form onSubmit={(evt) => evt.preventDefault()}>
				{children}
			</form>
		</FormContext.Provider>
	)
}

// useFormData gives everything that's provided through the FormContext. You get the whole set.
export function useFormData() {
	const data = useContext(FormContext)
	if (!data)
		throw new Error(`Cannot use Form data: not inside a Form component.`)
	return data
}

/* useFormParameter gives a tuple [data, setData] for a single input parameter with the given id. An options object may be passed along with the options:
 * - initialData: the initial data for the given field.
 * - persistent (default false): should the parameter stay (true) or be cleared (false) when the last subscriber unsubscribes from listening for this parameter?
 * - clean: turn a functional input object (possibly with cursors, selections and such) into a clean input object (ready to be stored into the database).
 * - functionalize: turn a clean input object (without cursors and without anything functional) into a functional input object (possibly with cursors or functionali components).
 */
export const defaultUseFormParameterOptions = {
	id: undefined,
	initialData: undefined,
	persistent: false,
	clean: passOn,
	functionalize: passOn,
}
export function useFormParameter(options = {}) {
	const { input, setParameter, subscribe, unsubscribe, saveCleanFunction } = useFormData()
	const { history } = useExerciseData()
	const { id, initialData, persistent, clean, functionalize } = processOptions(options, defaultUseFormParameterOptions)

	// Save the clean function for when it's needed.
	saveCleanFunction(id, clean)

	// Define custom handlers.
	const setData = useCallback(data => setParameter(id, data), [id, setParameter])

	// Subscribe upon mountain and unsubscribe upon unmounting. This also applies the initial data, if given.
	const initialDataRef = useRefWithValue(initialData)
	useEffect(() => {
		subscribe(id, initialDataRef.current)
		return () => unsubscribe(id, persistent) // Upon unmounting, remove the parameter.
	}, [id, persistent, subscribe, unsubscribe, initialDataRef])

	// Upon a history change, try to fill empty fields with previously submitted values. This is mainly useful upon page reloads for logged-in users to fill up the form. For regular page usage it often does not have an effect, unless later on a field is reused which was submitted in a previous input submission.
	useEffect(() => {
		const lastInput = getLastInput(history)
		if (lastInput && lastInput[id]) {
			setData(data => {
				// If there already was data, then keep it.
				if (!deepEquals(initialDataRef.current, data))
					return data

				// Functionalize the data from the history.
				return functionalize(lastInput[id])
			})
		}
	}, [id, history, setData, initialDataRef, functionalize])

	// Return the required tuple.
	if (!(id in input))
		return [initialData, setData]
	return [input[id], setData]
}

// useInput only returns a certain input parameter. It gives the FO (functional object), unless it specifically is asked by setting the second useSI parameter to true. It's mainly used by exercises. The id may be an array, in which case also an array is returned.
export function useInput(id, useSI = false) {
	const { getCleanInputParameter } = useFormData()

	// Define a handler to get the right value.
	const getInputParameter = (id) => {
		const SI = getCleanInputParameter(id)
		return useSI ? SI : toFO(SI, true)
	}

	// Depending on if we have an array of IDs or just one, process accordingly.
	if (Array.isArray(id))
		return id.map(currId => getInputParameter(currId))
	return getInputParameter(id)
}

// useFieldValidation takes a field id and a validation function. On a form submit this validation function is called and the result is given in the resulting parameter.
export function useFieldValidation(id, validate) {
	const { validation, validationInput, saveValidationFunction } = useFormData()
	useEffect(() => {
		const fieldValidate = (input) => validate(input[id])
		saveValidationFunction(id, fieldValidate)
		return () => saveValidationFunction(id, null)
	}, [id, validate, saveValidationFunction])
	return { validation: validation[id], validationInput: validationInput[id] }
}

// isValidationValid checks whether everything is OK with a given validation object. Returns a boolean.
function isValidationValid(validation) {
	return Object.keys(validation).length === 0
}

export function useCursorRef() {
	return useFormData().cursorRef
}

export function useAbsoluteCursorRef(apply = true) {
	const ref = useRef()
	const formData = useFormData()
	return apply ? formData.absoluteCursorRef : ref
}
