import React from 'react'

import { ensureInt, isBasicObject } from 'step-wise/util'

import { PluralContext } from './provider'
import * as checkers from './checkers'

// Set up a context which child components can refer to.
export function Plurals({ children, count }) {
	// Check the input. Manually check for a common occurrence that requires its own error.
	if (count === undefined)
		throw new Error(`Plurals error: no count value has been passed to the plural. A plural always requires a count value.`)
	count = ensureInt(count, true)
	console.log(count)

	// Set up the provider to provide the count to child components.
	return <PluralContext.Provider value={count}>{children}</PluralContext.Provider>
}

// Expose the checker components within this component.
Object.keys(checkers).forEach(key => Plurals[key] = checkers[key])
