import React, { useState, createContext, useContext } from 'react'

import { useRoute } from 'ui/routing'

const TabContext = createContext()
export default function TabProvider({ children }) {
	const route = useRoute()
	const [tabIndex, setTabIndex] = useState(0)

	// Set up the context value.
	const value = {
		tabIndex: route.tabs ? tabIndex : undefined, // On no tabs, give undefined as tabIndex.
		setTabIndex,
	}

	// Pass on the context value.
	return <TabContext.Provider value={value}>{children}</TabContext.Provider>
}

export function useTabContext() {
	return useContext(TabContext)
}

export function useTabIndex() {
	return useTabContext().tabIndex
}
