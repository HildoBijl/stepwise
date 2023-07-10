import { createContext, useContext } from 'react'

export const FieldControllerContext = createContext()

// Any consuming element can access the context.
export function useFieldControllerContext() {
	return useContext(FieldControllerContext)
}
