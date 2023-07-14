import { createContext, useContext } from 'react'

export const FormContext = createContext({})

export function useFormData() {
	const data = useContext(FormContext)
	if (!data)
		throw new Error(`Cannot use Form data: not inside a Form component.`)
	return data
}
