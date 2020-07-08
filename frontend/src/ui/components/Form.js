import React, { createContext, useState, useContext, useRef, useCallback, useEffect } from 'react'

import { useRefWithValue } from '../../util/react'

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

	// Define input parameter handlers.
	const setParameter = useCallback((parameter, value) => {
		setInput({ ...inputRef.current, [parameter]: value })
	}, [setInput, inputRef])

	const setParameters = useCallback((newInput, override = false) => {
		if (override)
			return newInput
		const result = { ...inputRef.current }
		Object.keys(newInput).forEach(key => result[key] = newInput[key])
		return result
	}, [inputRef])

	const clearForm = useCallback(() => setInput({}), [])

	// Define validation handlers.
	const isValid = useCallback((check = true) => {
		if (!check)
			return isValidationValid(validationRef.current)
		const validation = {}
		const input = inputRef.current
		Object.keys(validationFunctionsRef.current).forEach(name => {
			const validate = validationFunctionsRef.current[name]
			const result = validate(input)
			if (result)
				validation[name] = result
		})
		setValidation(validation)
		setValidationInput(input)
		return isValidationValid(validation)
	}, [inputRef, validationRef, validationFunctionsRef, setValidation])

	const saveValidationFunction = useCallback((name, validate) => {
		if (validate)
			validationFunctionsRef.current[name] = validate
		else
			delete validationFunctionsRef.current[name]
	}, [validationFunctionsRef])

	return (
		<FormContext.Provider value={{ input, setParameter, setParameters, clearForm, validation, validationInput, isValid, saveValidationFunction }}>
			<form onSubmit={(evt) => evt.preventDefault()}>
				{children}
			</form>
		</FormContext.Provider>
	)
}

export function useFormData() {
	const data = useContext(FormContext)
	if (!data)
		throw new Error(`Cannot use Form data: not inside a Form component.`)
	return data
}

// useFormParameter gives a tuple [value, setValue] for a single input parameter with the given name.
export function useFormParameter(name) {
	const { input, setParameter } = useFormData()
	return [input[name], value => setParameter(name, value)]
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
