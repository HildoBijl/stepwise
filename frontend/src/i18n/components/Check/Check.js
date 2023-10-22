import React from 'react'

import { SwitchContext } from './provider'
import * as conditions from './conditions'

// Set up a context which child components can refer to.
export function Check({ children, value }) {
	// Check the input.
	if (value === undefined)
		throw new Error(`Check error: no "value" parameter has been passed to the Check. (It does not accept undefined.) Make sure a value that is non-undefined is inserted. (If needed, you can use value={!!value} to guarantee a boolean value.)`)

	// Set up the provider to provide the count to child components.
	return <SwitchContext.Provider value={value}>{children}</SwitchContext.Provider>
}

// Expose the conditions components within this component.
Object.keys(conditions).forEach(key => { Check[key] = conditions[key] })
