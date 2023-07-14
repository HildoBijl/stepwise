import { createContext, useContext } from 'react'

export const InputContext = createContext({})

export function useInputData() {
	const data = useContext(InputContext)
	if (!data)
		throw new Error(`Cannot use Input data: not inside a Input component.`)
	return data
}
