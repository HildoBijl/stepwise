import React, { createContext, useState, useContext, useRef, useCallback, useEffect } from 'react'

import { isBasicObject, processOptions, filterProperties, deepEquals, ensureConsistency, keysToObject } from 'step-wise/util/objects'
import { noop, passOn, resolveFunctions } from 'step-wise/util/functions'
import { toFO } from 'step-wise/inputTypes'

import { useRefWithValue, useMountedRef } from 'util/react'

import { useFieldControllerContext } from './FieldController'

const FormContext = createContext(null)

export default function Form({ children, initialInput }) {
	// Define states.
	const [input, setInput] = useState({})
	const [validation, setValidation] = useState({ result: {}, input: {} })

	// Define refs. These store important data that do not require rerenders.
	const fieldsRef = useRef({})
	const cursorRef = useRef()
	const absoluteCursorRef = useRef()

	// Define refs of values.
	const inputRef = useRefWithValue(input)
	const validationRef = useRefWithValue(validation)
	const initialInputRef = useRefWithValue(initialInput)

	// Get other parameters.
	const { activateFirst } = useFieldControllerContext()
	const mountedRef = useMountedRef()

	// Define input parameter handlers.
	const subscribe = useCallback((options) => {
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
				FI: undefined,
				recentFI: false,
			}
			return { ...input, [id]: functionalize(initialSI) }
		})
	}, [setInput, fieldsRef, initialInputRef])

	const unsubscribe = useCallback(id => {
		setTimeout(() => { // Delay calls to unsubscribe, to ensure all subscribe calls are finished.
			if (!mountedRef.current)
				return // Prevent calls when we have unmounted in the meantime.
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
	}, [mountedRef, setInput, fieldsRef])

	const setParameter = useCallback((id, FI) => {
		setInput((input) => {
			const oldFI = input[id]
			const newFI = resolveFunctions(FI, oldFI)
			const newInput = ensureConsistency({
				...input,
				[id]: newFI,
			}, input)
			if (newInput[id] !== input[id])
				fieldsRef.current[id].recentSI = false
			return newInput
		})
	}, [setInput, fieldsRef])

	// getFields returns all fields (including persistent but removed fields) while getSubscribedFields returns an array of fields that have an active subscription. Persistent fields that are not visible are then filtered out.
	const getFields = useCallback(() => Object.keys(fieldsRef.current), [fieldsRef])
	const getSubscribedFields = useCallback(() => {
		const fields = fieldsRef.current
		return Object.keys(fields).filter(id => fields[id].subscriptions > 0)
	}, [fieldsRef])

	// getField returns the data corresponding to the field with the given ID.
	const getField = useCallback(id => {
		return fieldsRef.current[id]
	}, [fieldsRef])

	// setInputSI can overwrite the entire content of the form with a given form SI object.
	const setInputSI = useCallback(inputSI => {
		setInput(input => {
			const newInput = { ...input }
			Object.keys(inputSI).forEach(id => {
				const field = getField(id)
				if (field === undefined)
					return // When the field does not exist, do not apply the new input value.
				newInput[id] = field.functionalize(inputSI[id])
				field.SI = inputSI[id]
				field.recentSI = true
				field.recentFO = false
			})
			return ensureConsistency(newInput, input)
		})
	}, [setInput, getField])

	// These functions allow us to easily get input in various forms.
	const getInputParameterFI = useCallback((id) => inputRef.current[id], [inputRef])
	const getInputFI = useCallback((filterUnsubscribed = true) => filterUnsubscribed ? filterProperties(inputRef.current, getSubscribedFields()) : inputRef.current, [inputRef, getSubscribedFields])
	const getInputParameterSI = useCallback((id) => {
		const FI = getInputParameterFI(id)
		if (FI === undefined)
			return undefined
		const field = getField(id)
		if (!field.recentSI) {
			const newSI = ensureConsistency(field.clean(FI), field.SI)
			if (!field.equals(newSI, field.SI))
				field.recentFO = false // The SI changes, so the FO is not recent anymore. Note this, in case it's requested.
			field.SI = newSI
			field.recentSI = true
		}
		return field.SI
	}, [getField, getInputParameterFI])
	const getInputSI = useCallback((filterUnsubscribed = true) => keysToObject(filterUnsubscribed ? getSubscribedFields() : getFields(), id => getInputParameterSI(id)), [getFields, getSubscribedFields, getInputParameterSI])
	const getInputParameterFO = useCallback((id) => {
		const SI = getInputParameterSI(id) // This updates recentFO if outdated.
		if (SI === undefined)
			return undefined
		const field = getField(id)
		if (!field.recentFO) {
			try {
				delete field.FO // Make sure there is no FO in case interpretation fails.
				delete field.error // Remove a potential previous error.
				field.FO = toFO(SI, true)
				field.recentFO = true
			} catch (error) {
				field.error = error
			}
		}
		return field.FO
	}, [getField, getInputParameterSI])
	const getInputFO = useCallback((filterUnsubscribed = true) => keysToObject(filterUnsubscribed ? getSubscribedFields() : getFields(), id => getInputParameterFO(id)), [getFields, getSubscribedFields, getInputParameterFO])

	// isInputEqual is used to compare SI input objects. It is either given two input values (and these are compared) or it is given one, in which case the current input is compared.
	const isInputEqual = useCallback((a, b = getInputSI()) => {
		if ((a === undefined || b === undefined) && a !== b)
			return false
		const aKeys = Object.keys(a), bKeys = Object.keys(b)
		if (aKeys.length !== bKeys.length)
			return false
		return aKeys.every(key => {
			const fieldFunctions = getField(key)
			return fieldFunctions && fieldFunctions.equals(a[key], b[key])
		})
	}, [getInputSI, getField])

	// Define validation handlers.
	const isValid = useCallback((check = true) => {
		if (!check)
			return isValidationValid(validationRef.current.result)
		const result = {}
		const inputSI = getInputSI()
		const inputFO = getInputFO()
		getSubscribedFields().forEach(id => { // Walk through all validation functions and run them.
			const field = getField(id)
			if (field.error) { // On an error in the interpretation get a corresponding message.
				result[id] = field.errorToMessage(field.error)
			} else { // On a correct interpretation run the given validation function.
				const fieldResult = getField(id).validate(inputFO[id], inputFO)
				if (fieldResult)
					result[id] = fieldResult
			}
		})
		setValidation({ result, input: inputSI }) // Always store and compare SIs.
		activateFirst(Object.keys(result)) // Put the cursor in the first non-valid field.
		return isValidationValid(result)
	}, [validationRef, getInputSI, getInputFO, getSubscribedFields, getField, setValidation, activateFirst])

	// Upon a change of the initialInput, try to implement it. If a field's value equals its initialValue (and is hence unchanged) then apply the initialInput for this field.
	useEffect(() => {
		// Check the initial input.
		if (initialInput === undefined)
			return
		if (!isBasicObject(initialInput))
			throw new Error(`Invalid initial Form input: received an initialInput parameter for a Form but it was of type "${typeof initialInput}". A basic object with various parameters was expected.`)

		// Apply each parameter given in the initial input.
		setInput(input => {
			const newInput = { ...input }
			Object.keys(initialInput).forEach(id => {
				if (newInput[id] === undefined)
					return // When the field does not exist, do not apply the new initial input.
				const currentSI = getInputParameterSI(id)
				const field = getField(id)
				if (!field.equals(currentSI, field.initialSI))
					return // When the user already changed the input, do not apply the new initial input.
				newInput[id] = field.functionalize(initialInput[id])
				field.SI = initialInput[id]
				field.recentSI = true
				field.recentFO = false
			})
			return ensureConsistency(newInput, input)
		})
	}, [initialInput, setInput, getField, getInputParameterSI])

	return (
		<FormContext.Provider value={{ input, subscribe, unsubscribe, setParameter, setInputSI, getFields, getSubscribedFields, validation, isValid, getField, getInputParameterFI, getInputFI, getInputParameterSI, getInputSI, getInputParameterFO, getInputFO, isInputEqual, cursorRef, absoluteCursorRef }}>
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

/* useFormParameter gives a tuple [FI, setFI] for a single input parameter with the given id. An options object may be passed along with the options:
 * - initialSI: the initial SI value for the input field.
 * - validate: a function that receives the Functional Object (FO) which is the interpreted variant of the input. It then either returns undefined (on all OK) or an error message (on a problem).
 * - clean: turn a Functional Input (FI) object (possibly with cursors, selections and such) into a Stored Input (SI) object (ready to be stored into the database).
 * - functionalize: turn an SI object (without cursors and without anything functional) into an FI object (possibly with cursors or functional components).
 * - persistent (default false): should the parameter stay (true) or be cleared (false) when the last subscriber unsubscribes from listening for this parameter?
 * - equals: a function that checks if two Stored Input (SI) objects are considered equal. It is used to check if the same feedback should still be shown. By default this is deepEquals.
 * - errorToMessage: a function that takes an error thrown by the interpretation (SItoFO) script and turns it into a sensible message to show to the user, preferably having as much information as possible.
 */
export const defaultUseFormParameterOptions = {
	id: undefined,
	initialSI: undefined,
	validate: noop,
	clean: passOn,
	functionalize: passOn,
	persistent: false,
	equals: deepEquals,
	errorToMessage: () => <>Oops ... ik begrijp niet wat je hier getypt hebt.</>,
}
export function useFormParameter(options = {}) {
	const { input, setParameter, subscribe, unsubscribe } = useFormData()
	options = processOptions(options, defaultUseFormParameterOptions)
	const optionsRef = useRefWithValue(options)
	const { id, initialSI, functionalize } = options

	// Subscribe upon mounting and unsubscribe upon unmounting.
	useEffect(() => {
		subscribe(optionsRef.current)
		return () => unsubscribe(id)
	}, [id, optionsRef, subscribe, unsubscribe])

	// Return the FI including a handler to reset it, just like the React setState.
	const FI = (id in input) ? input[id] : functionalize(initialSI)
	const setFI = useCallback(FI => setParameter(id, FI), [id, setParameter])
	return [FI, setFI]
}

// useInput only returns a certain input parameter. It gives the FO (functional object), unless it specifically is asked by setting the second useFI parameter to true, in which case the FI (functional input) object is returned. It's mainly used by exercises. The ids property may be a string or an array, in which case also an array is returned. Optionally, it may be undefined/falsy, in which case all fields are given.
export function useInput(ids, useFI = false) {
	const { getInputFI, getInputFO, getInputParameterFI, getInputParameterFO } = useFormData()

	// If no id has been given, return everything.
	if (ids === undefined)
		return Object.values((useFI ? getInputFI : getInputFO)())

	// Depending on if we have an array of IDs or just one, process accordingly.
	const getParameter = useFI ? getInputParameterFI : getInputParameterFO
	return Array.isArray(ids) ? ids.map(currId => getParameter(currId)) : getParameter(ids)
}

// useInputObject provides a full input object. (Contrary to useInput which provides an array).
export function useInputObject(ids, useFI = false) {
	const { getInputFI, getInputFO, getInputParameterFI, getInputParameterFO } = useFormData()

	// If no id has been given, return everything.
	if (ids === undefined)
		return (useFI ? getInputFI : getInputFO)()

	// Turn each id into the right object.
	const getParameter = useFI ? getInputParameterFI : getInputParameterFO
	return keysToObject(Array.isArray(ids) ? ids : [ids], id => getParameter(id))
}

// useFieldValidation takes a field id and returns the latest validation data for that field.
export function useFieldValidation(id) {
	const { validation } = useFormData()
	return {
		result: validation.result[id],
		input: validation.input[id],
	}
}

// isValidationValid checks whether everything is OK with a given validation result object. Returns a boolean.
function isValidationValid(validationResult) {
	return Object.keys(validationResult).length === 0
}

export function useCursorRef() {
	return useFormData().cursorRef
}

export function useAbsoluteCursorRef(apply = true) {
	const ref = useRef()
	const formData = useFormData()
	return apply ? formData.absoluteCursorRef : ref
}
