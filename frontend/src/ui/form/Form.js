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
	const setParameter = useCallback((id, value) => {
		setInput((input) => {
			const oldValue = input[id]
			const newValue = typeof value === 'function' ? value(oldValue) : value
			return {
				...input,
				[id]: ensureConsistency(newValue, oldValue),
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

	const subscribe = useCallback((id, initialValue) => {
		setSubscriptions(subscriptions => ({ ...subscriptions, [id]: (subscriptions[id] || 0) + 1 }))
		if (initialValue !== undefined) {
			setInput((input) => {
				if (input[id] !== undefined)
					return input
				return { ...input, [id]: (typeof initialValue === 'function' ? initialValue() : initialValue) }
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

/* useFormParameter gives a tuple [value, setValue] for a single input parameter with the given id. An options object may be passed along with the options:
 * - initialValue: the initial value of the parameter.
 * - subscribe (default false): whether we should note that a React object is controlling this. (Should be true for setters, false (default) for readers.) If the number of subscribers drops to zero, then the field is cleared.
 * - persistent (default false): should the parameter stay (true) or be cleared (false) when the last subscriber unsubscribes from listening for this parameter?
 */
const defaultUseFormParameterOptions = {
	initialValue: undefined, // undefined
	subscribe: false,
	persistent: false,
}
export function useFormParameter(id, options = {}) {
	const { input, setParameter, subscribe, unsubscribe } = useFormData()
	const { history } = useExerciseData()
	const { initialValue, subscribe: shouldSubscribe, persistent } = processOptions(options, defaultUseFormParameterOptions)

	// Define custom handlers.
	const setValue = useCallback(value => setParameter(id, value), [id, setParameter])

	// Subscribe if required, and unsubscribe upon unmounting. This also sets an initial value, if given.
	const initialValueRef = useRefWithValue(initialValue)
	useEffect(() => {
		if (shouldSubscribe) {
			subscribe(id, initialValueRef.current)
			return () => unsubscribe(id, persistent) // Upon unmounting, remove the parameter.
		}
	}, [id, shouldSubscribe, persistent, subscribe, unsubscribe, initialValueRef])

	// Upon a history change, try to fill empty fields with previously submitted values. This is mainly useful upon page reloads for logged-in users to fill up the form. For regular page usage it often does not have an effect, unless later on a field is reused which was submitted in a previous input submission.
	useEffect(() => {
		const lastInput = getLastInput(history)
		if (lastInput && lastInput[id]) {
			setValue(value => {
				// If there already was a value, then keep it.
				if (!isEmpty(value))
					return value
				// Use a clone of the input from the history.
				if (Array.isArray(lastInput[id]))
					return [...lastInput[id]]
				return { ...lastInput[id] }
			})
		}
	}, [id, history, setValue])

	// Return the required tuple.
	if (!(id in input))
		return [initialValue, setValue]
	return [input[id], setValue]
}

// useInput only returns a certain input parameter, but it gives the FO (functional object). It's mainly used by exercises.
export function useInput(id) {
	const { input } = useFormData()
	if (input[id] === undefined)
		return undefined
	return IOtoFO(input[id])
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
