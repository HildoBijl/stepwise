import React, { createContext, useContext } from 'react'

const TestContext = createContext(false)

export function TestProvider({ children }) {
	return (
		<TestContext.Provider value={true}>
			{children}
		</TestContext.Provider>
	)
}

export function useTestContext() {
	return useContext(TestContext)
}
