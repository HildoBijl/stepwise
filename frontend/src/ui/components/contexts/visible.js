import React, { createContext, useContext } from 'react'

const VisibleContext = createContext()

// The VisibleProvider is set up by a parent component who knows whether it's visible or not. It tells this to its components.
export function VisibleProvider({ children, visible }) {
	const parentVisible = useVisible() // If the parent is invisible, then this is invisible too.
	return <VisibleContext.Provider value={parentVisible && visible}>{children}</VisibleContext.Provider>
}

export function useVisibleContext() {
	return useContext(VisibleContext)
}

// useVisible is called by a component to check if it's visible.
export function useVisible() {
	const context = useVisibleContext()
	return context === undefined ? true : context // When no context is available, assume visibility.
}
