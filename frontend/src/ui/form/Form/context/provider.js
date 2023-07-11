import { createContext, useContext } from 'react'

// Set up a context so elements inside the drawing can ask for the drawing.
export const FormContext = createContext({})

// useFormData gives everything that's provided through the FormContext. You get the whole set.
export function useFormData() {
	const data = useContext(FormContext)
	if (!data)
		throw new Error(`Cannot use Form data: not inside a Form component.`)
	return data
}
