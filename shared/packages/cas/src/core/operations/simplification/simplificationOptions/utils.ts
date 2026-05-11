import { fromKeys, mergeDefaults } from '@step-wise/utils'

import { allSimplificationOptions } from './allSimplificationOptions'
import { type SimplificationOption, type SimplificationOptions } from './types'

// An object that functions as default SimplificationOptions.
export const defaultSimplificationOptions: SimplificationOptions = fromKeys(allSimplificationOptions, () => false) as SimplificationOptions

// Turn a SimplificationOptions object into a list of options that have been turned on.
export function getActiveSimplificationOptions(options: SimplificationOptions): SimplificationOption[] {
	return (Object.keys(options) as SimplificationOption[]).filter(key => options[key])
}

// Set up a SimplificationOptions object from a list of options.
export function getSimplificationOptionsFromList(addOptions: SimplificationOption[], existingOptions: Partial<SimplificationOptions> = {}, removeOptions: SimplificationOption[] = []) {
	const options = mergeDefaults(existingOptions, defaultSimplificationOptions)
	addOptions.forEach(option => { options[option] = true })
	removeOptions.forEach(option => { options[option] = false })
	return options
}

// Set up a SimplificationOptions object from a set of options.
export function getSimplificationOptionsFromSet(addOptions: ReadonlySet<SimplificationOption>, existingOptions: Partial<SimplificationOptions> = {}, removeOptions: ReadonlySet<SimplificationOption> = new Set()): SimplificationOptions {
	const options = mergeDefaults(existingOptions, defaultSimplificationOptions)
	addOptions.forEach(option => { options[option] = true })
	removeOptions.forEach(option => { options[option] = false })
	return options
}
