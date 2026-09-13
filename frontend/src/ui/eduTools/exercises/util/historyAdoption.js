import React, { createContext, useContext, useMemo, useState } from 'react'

const InputHistoryAdoptionContext = createContext()

export function InputHistoryAdoptionProvider({ children }) {
	const [adoptUserHistory, setAdoptUserHistory] = useState()
	const value = useMemo(() => ({ adoptUserHistory, setAdoptUserHistory }), [adoptUserHistory])
	return <InputHistoryAdoptionContext.Provider value={value}>{children}</InputHistoryAdoptionContext.Provider>
}

export function useInputHistoryAdoption() {
	const value = useContext(InputHistoryAdoptionContext)
	if (!value) throw new Error(`Cannot use input history adoption outside an InputHistoryAdoptionProvider.`)
	return value
}
