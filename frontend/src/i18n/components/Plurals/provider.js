import { createContext, useContext } from 'react'

export const PluralContext = createContext({})

export function usePluralCount() {
	return useContext(PluralContext)
}
