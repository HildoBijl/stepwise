import React from 'react'

import { ensureInt } from 'step-wise/util'

import { Check } from '../Check'

import * as conditions from './conditions'

// Set up a context which child components can refer to.
export function Plurals({ children, value }) {
	// Check the input. Manually check for a common occurrence that requires its own error.
	if (value === undefined)
		throw new Error(`Plurals error: no value has been passed to the plural. A plural always requires a value.`)
	value = ensureInt(value, true)

	// Set up the provider to provide the count to child components.
	return <Check value={value}>{children}</Check>
}
Plurals.tag = 'count-check'

// Expose the conditions components within this component.
Object.keys(conditions).forEach(key => { Plurals[key] = conditions[key] })
