import React, { createContext, useState, useContext, useRef, useCallback, useEffect } from
	'react'

import { getLastInput } from 'step-wise/edu/exercises/util/simpleExercise'
import { isEmpty } from 'step-wise/inputTypes'

import { useRefWithValue } from '../../../util/react'
import { useExerciseData } from '../ExerciseContainer'

const FormContext = createContext(null)

export default function Form({ children }) {
	// Define states.
	const [input, setInput] = useState({})
	const [validation, setValidation] = useState({})
	const [validationInput, setValidationInput] = useState({})

	// Define refs. We use refs along with state parameters to allow callback functions to remain constant.
	const validationFunctionsRef = useRef({})
	const inputRef = useRefWithValue(input)
	const validationRef = useRefWithValue(validation)
	const cursorRef = useRef()

	// Define input parameter handlers.
	const setParameter = useCallback((id, value) => {
		setInput((input) => ({
			...input,
			[id]: (typeof value === 'function' ? value(input[id]) : value),
		}))
	}, [setInput])

	const deleteParameter = useCallback((id) => {
		setInput((input) => {
			const newInput = { ...input }
			delete newInput[id]
			return newInput
		})
	}, [setInput])

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
		return isValidationValid(validation)
	}, [inputRef, validationRef, validationFunctionsRef, setValidation])

	const saveValidationFunction = useCallback((id, validate) => {
		if (validate)
			validationFunctionsRef.current[id] = validate
		else
			delete validationFunctionsRef.current[id]
	}, [validationFunctionsRef])

	return (
		<FormContext.Provider value={{ input, setParameter, deleteParameter, setParameters, clearForm, validation, validationInput, isValid, saveValidationFunction, cursorRef }}>
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

// useFormParameter gives a tuple [value, setValue] for a single input parameter with the given id. An initial value may also be passed along.
export function useFormParameter(id, initialValue) {
	const { input, setParameter, deleteParameter } = useFormData()
	const { history } = useExerciseData()

	// If this is the first time, set the initial value.
	const setValue = useCallback(value => setParameter(id, value), [id, setParameter])
	const initialValueRef = useRefWithValue(initialValue), inputRef = useRefWithValue(input)
	useEffect(() => {
		if (!(id in inputRef.current) && initialValueRef.current !== undefined)
			setValue(initialValueRef.current)
		return () => deleteParameter(id) // Upon unmounting, remove the parameter.
	}, [id, inputRef, initialValueRef, setValue, deleteParameter])

	// Upon a history change, update the value of this input to the history to match the given input. This should not change anything during page activity but be relevant during reloads.
	useEffect(() => {
		const lastInput = getLastInput(history)
		if (lastInput && lastInput[id])
			setValue(value => {
				if (!isEmpty(value))
					return value
				return { ...lastInput[id] }
			})
	}, [id, history, setValue])

	// Return the required tuple.
	if (!(id in input))
		return [initialValue, setValue]
	return [input[id], setValue]
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
