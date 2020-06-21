import React, { createContext, useState, useContext } from 'react'

const FormContext = createContext(null)

export default function Form({ children }) {
	const [input, setInput] = useState({})
	const setParameter = (parameter, value) => {
		setInput({ ...input, [parameter]: value })
	}
	const setParameters = (newInput, override = false) => {
		if (override)
			return newInput
		const result = { ...input }
		Object.keys(newInput).forEach(key => result[key] = newInput[key])
		return result
	}
	const clearForm = () => setInput({})

	return (
		<FormContext.Provider value={{ input, setParameter, setParameters, clearForm }}>
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

export function useFormParameter(name) {
	const { input, setParameter } = useFormData()
	return [input[name], value => setParameter(name, value)]
}