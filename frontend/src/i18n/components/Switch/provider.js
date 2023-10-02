import { createContext, useContext } from 'react'

export const SwitchContext = createContext({})

export function useSwitchValue() {
	return useContext(SwitchContext)
}
