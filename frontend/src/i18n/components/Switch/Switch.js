import React from 'react'

import { SwitchContext } from './provider'
import * as checkers from './checkers'

// Set up a context which child components can refer to.
export function Switch({ children, value }) {
	// Check the input.
	if (value === undefined)
		throw new Error(`Switch error: no value has been passed to the Switch. (It does not accept undefined.) Make sure a value that is non-undefined is inserted. If needed, you can use value={!!value}.`)

	// Set up the provider to provide the count to child components.
	return <SwitchContext.Provider value={value}>{children}</SwitchContext.Provider>
}

// Expose the checker components within this component.
Object.keys(checkers).forEach(key => { Switch[key] = checkers[key] })
