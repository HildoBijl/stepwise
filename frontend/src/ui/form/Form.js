import React, { createContext, useState, useContext, useRef, useCallback, useEffect } from 'react'

import { processOptions, deepEquals, ensureConsistency, applyToEachParameter } from 'step-wise/util/objects'
import { passOn, resolveFunctions } from 'step-wise/util/functions'
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
	const functionsRef = useRef({})
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
			const newData = resolveFunctions(data, oldData)
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
				return { ...input, [id]: initialData }
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

	// saveFieldFunction stores field functions like validate, clean, functionalize, equals, etcetera. You can set one through saveFieldFunction or multiple at the same time through saveFieldFunctions. Set it to a falsy value to remove one.
	const saveFieldFunction = useCallback((id, name, func) => {
		if (!functionsRef.current[id])
			functionsRef.current[id] = {}
		if (func)
			functionsRef.current[id][name] = func
		else
			delete functionsRef.current[id][name]
	}, [functionsRef])
	const saveFieldFunctions = useCallback((id, funcs) => {
		Object.keys(funcs).forEach(key => saveFieldFunction(id, key, funcs[key]))
	}, [saveFieldFunction])
	const getFieldFunction = useCallback((id, name) => functionsRef.current[id] && functionsRef.current[id][name], [functionsRef])

	// These functions allow us to easily get input in various forms.
	const getInputFI = useCallback(() => inputRef.current, [inputRef])
	const getInputParameterFI = useCallback((id) => inputRef.current[id], [inputRef])
	const getInputSI = useCallback(() => {
		return applyToEachParameter(inputRef.current, (input, id) => {
			const clean = getFieldFunction(id, 'clean')
			return input !== undefined && clean ? clean(input) : input
		})
	}, [inputRef, getFieldFunction])
	const getInputParameterSI = useCallback((id) => {
		const input = inputRef.current[id]
		const clean = getFieldFunction(id, 'clean')
		return input !== undefined && clean ? clean(input) : input
	}, [inputRef, getFieldFunction])
	const getInputFO = useCallback(() => toFO(getInputSI(), true), [getInputSI])
	const getInputParameterFO = useCallback((id) => toFO(getInputParameterSI(id), true), [getInputParameterSI])

	// Define validation handlers.
	const isValid = useCallback((check = true) => {
		if (!check)
			return isValidationValid(validationRef.current)
		const validation = {}
		const inputFI = getInputFI()
		const inputSI = getInputSI()
		Object.keys(inputFI).forEach(id => { // Walk through all validation functions and run them.
			const validate = getFieldFunction(id, 'validate')
			if (validate) {
				const result = validate(inputFI[id], inputFI) // Call validation function with functional input for that field and complete functional input as extra parameter if needed.
				if (result)
					validation[id] = result
			}
		})
		setValidation(validation)
		setValidationInput(inputSI) // Always store and compare SIs.
		activateFirst(Object.keys(validation)) // Put the cursor in the first non-valid field.
		return isValidationValid(validation)
	}, [validationRef, getInputFI, getInputSI, getFieldFunction, setValidation, activateFirst])

	return (
		<FormContext.Provider value={{ input, setParameter, deleteParameter, subscribe, unsubscribe, setParameters, clearForm, validation, validationInput, isValid, saveFieldFunction, saveFieldFunctions, getFieldFunction, getInputFI, getInputParameterFI, getInputSI, getInputParameterSI, getInputFO, getInputParameterFO, cursorRef, absoluteCursorRef }}>
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
 * - equals: a function that checks if two Stored Input (SI) data objects are considered equal. It is used to check if the same feedback should still be shown. By default this is deepEquals.
 */
export const defaultUseFormParameterOptions = {
	id: undefined,
	initialData: undefined,
	persistent: false,
	clean: passOn,
	functionalize: passOn,
	equals: deepEquals,
}
export function useFormParameter(options = {}) {
	const { input, setParameter, subscribe, unsubscribe, saveFieldFunctions, getFieldFunction } = useFormData()
	const { history } = useExerciseData()
	const { id, initialData, persistent, clean, functionalize, equals } = processOptions(options, defaultUseFormParameterOptions)

	// Save the clean function for when it's needed.
	saveFieldFunctions(id, { clean, functionalize, equals })

	// Define custom handlers.
	const setData = useCallback(data => setParameter(id, data), [id, setParameter])

	// Subscribe upon mounting and unsubscribe upon unmounting. This also applies the initial data, if given.
	const initialDataRef = useRefWithValue(initialData)
	useEffect(() => {
		subscribe(id, functionalize(initialDataRef.current))
		return () => unsubscribe(id, persistent) // Upon unmounting, remove the parameter.
	}, [id, persistent, subscribe, unsubscribe, initialDataRef, functionalize])

	// Upon a history change, try to fill empty fields with previously submitted values. This is mainly useful upon page reloads for logged-in users to fill up the form. For regular page usage it often does not have an effect, unless later on a field is reused which was submitted in a previous input submission.
	useEffect(() => {
		const lastInput = getLastInput(history)
		if (lastInput && lastInput[id]) {
			setData(data => {
				// If the data has been changed since the initial data provision, keep the new data.
				if (!equals(clean(data), initialDataRef.current))
					return data

				// Use the data from the history, after functionalizing it.
				return functionalize(lastInput[id])
			})
		}
	}, [id, history, setData, initialDataRef, clean, functionalize, equals, getFieldFunction])

	// Return the required tuple.
	if (!(id in input))
		return [functionalize(initialData), setData]
	return [input[id], setData]
}

// useInput only returns a certain input parameter. It gives the FO (functional object), unless it specifically is asked by setting the second useFI parameter to true, in which case the FI (functional input) object is returned. It's mainly used by exercises. The id may be an array, in which case also an array is returned.
export function useInput(id, useFI = false) {
	const { getInputParameter, getInputParameterFO } = useFormData()

	// Define a handler to get the right value.
	const getParameter = useFI ? getInputParameter : getInputParameterFO

	// Depending on if we have an array of IDs or just one, process accordingly.
	if (Array.isArray(id))
		return id.map(currId => getParameter(currId))
	return getParameter(id)
}

// useFieldValidation takes a field id and a validation function. On a form submit this validation function is called and the result is given in the resulting parameter.
export function useFieldValidation(id, validate) {
	const { validation, validationInput, saveFieldFunction } = useFormData()
	useEffect(() => {
		saveFieldFunction(id, 'validate', validate)
		return () => saveFieldFunction(id, 'validate', undefined)
	}, [id, validate, saveFieldFunction])
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
