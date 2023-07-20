import { createContext, useContext } from 'react'

export const DrawingInputContext = createContext({})

export function useDrawingInputData() {
	const data = useContext(DrawingInputContext)
	if (!data)
		throw new Error(`Cannot use DrawingInput data: not inside a DrawingInput component.`)
	return data
}
