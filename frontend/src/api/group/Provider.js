
import React, { createContext, useContext } from 'react'

// Put the query results in a context, so there's a single source of truth.
const GroupContext = createContext(null)
export function ActiveGroupProvider({ children }) {
	// const result = useMyActiveGroupQuery() // ToDo
	
	return (
		<GroupContext.Provider value={{}}>
			{children}
		</GroupContext.Provider>
	)
}

// Get the data out of the context.
export function useActiveGroup() {
	return useContext(GroupContext)
}
