import { createContext, useContext } from 'react'

export const CheckContext = createContext({})

export function useCheckValue() {
	return useContext(CheckContext)
}
