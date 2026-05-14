import { isReadonlyArray, union, difference } from '@step-wise/utils'

import { allSimplificationOptions } from './allSimplificationOptions'
import type { SimplificationOption, SimplificationOptions, SimplificationOptionsInput } from './types'

// Turn a SimplificationOptionsInput parameter into a set of simplification options.
export function asSimplificationOptionsSet(options: SimplificationOptionsInput): SimplificationOptions {
	return isReadonlyArray(options) ? new Set(options) : options
}

// Adjust existing simplification options. This can be done either through an adjustment object or through addition/removal sets/lists.
export function adjustSimplificationOptions(options: SimplificationOptionsInput, addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): SimplificationOptions {
	const optionsSet = asSimplificationOptionsSet(options)
	const addOptionsSet = asSimplificationOptionsSet(addOptions)
	const removeOptionsSet = asSimplificationOptionsSet(removeOptions)
	return difference(union(optionsSet, addOptionsSet), removeOptionsSet)
}

// Check a given set of simplification options.
export function isSimplificationOption(value: unknown): value is SimplificationOption {
	return typeof value === 'string' && allSimplificationOptions.has(value as SimplificationOption)
}
export function ensureSimplificationOptionSet(value: unknown): ReadonlySet<SimplificationOption> {
	if (!(value instanceof Set)) throw new TypeError('Invalid simplification options: expected a Set.')
	for (const option of value) {
		if (!isSimplificationOption(option)) throw new TypeError(`Invalid simplification option "${String(option)}".`)
	}
	return value
}
