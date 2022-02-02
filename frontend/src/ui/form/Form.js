import React, { createContext, useState, useContext, useRef, useCallback, useEffect } from
	'react'

import { processOptions, ensureConsistency } from 'step-wise/util/objects'
import { isEmpty, IOtoFO } from 'step-wise/inputTypes'
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

	// Define validation handlers.
	const isValid = useCallback((check = true) => {
		if (!check)
			return isValidationValid(validationRef.current)
		const validation = {}
		const input = inputRef.current
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
	}, [inputRef, validationRef, validationFunctionsRef, setValidation, activateFirst])

	const saveValidationFunction = useCallback((id, validate) => {
		if (validate)
			validationFunctionsRef.current[id] = validate
		else
			delete validationFunctionsRef.current[id]
	}, [validationFunctionsRef])

	return (
		<FormContext.Provider value={{ input, setParameter, deleteParameter, subscribe, unsubscribe, setParameters, clearForm, validation, validationInput, isValid, saveValidationFunction, cursorRef, absoluteCursorRef }}>
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
 */
export const defaultUseFormParameterOptions = {
	id: undefined,
	initialData: undefined,
	persistent: false,
}
export function useFormParameter(options = {}) {
	const { input, setParameter, subscribe, unsubscribe } = useFormData()
	const { history } = useExerciseData()
	const { id, initialData, persistent } = processOptions(options, defaultUseFormParameterOptions)

	// Define custom handlers.
	const setData = useCallback(data => setParameter(id, data), [id, setParameter])

	// Subscribe if required, and unsubscribe upon unmounting. This also applies the initial data, if given.
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
				if (!isEmpty(data))
					return data
				// Use a clone of the input from the history.
				if (Array.isArray(lastInput[id]))
					return [...lastInput[id]]
				return { ...lastInput[id] }
			})
		}
	}, [id, history, setData])

	// Return the required tuple.
	if (!(id in input))
		return [initialData, setData]
	return [input[id], setData]
}

// useInput only returns a certain input parameter. It gives the FO (functional object), unless it specifically is asked by setting the second rawInput parameter to true. It's mainly used by exercises. The id may be an array, in which case also an array is returned.
export function useInput(id, rawInput = false) {
	const { input } = useFormData()
	const processValue = (value) => (rawInput || value === undefined ? value : IOtoFO(value))
	if (Array.isArray(id))
		return id.map(currId => processValue(input[currId]))
	return processValue(input[id])
}

// useFieldValidation takes a field name and a validation function. On a form submit this validation function is called and the result is given in the resulting parameter.
export function useFieldValidation(name, validate) {
	const { validation, validationInput, saveValidationFunction } = useFormData()
	useEffect(() => {
		const fieldValidate = (input) => validate(input[name])
		saveValidationFunction(name, fieldValidate)
		return () => saveValidationFunction(name, null)
	}, [name, validate, saveValidationFunction])
	return { validation: validation[name], validationInput: validationInput[name] }
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
