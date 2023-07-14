import { createContext, useContext } from 'react'

export const FieldControllerContext = createContext()

export function useFieldControllerContext() {
	return useContext(FieldControllerContext)
}
