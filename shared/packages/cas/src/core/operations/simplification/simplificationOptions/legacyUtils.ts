// Simplification Preset Legacy: the following util files are still for the old SimplificationOptions objects.

import { fromKeys, mergeDefaults } from '@step-wise/utils'

import { allSimplificationOptionsList } from './allSimplificationOptions'
import type { SimplificationOption, SimplificationOptions, SimplificationOptionsObject } from './types'

// An object that functions as default SimplificationOptions.
export const defaultSimplificationOptionsObject: SimplificationOptionsObject = fromKeys(allSimplificationOptionsList, () => false) as SimplificationOptionsObject

// Legacy Simplification Presets: Turn a SimplificationOptions object into a list of options that have been turned on.
export function getActiveSimplificationOptions(options: SimplificationOptionsObject): ReadonlySet<SimplificationOption> {
	return new Set((Object.keys(options) as SimplificationOption[]).filter(key => options[key]))
}

// Legacy Simplification Presets: Turn a list of options into an object.
export function getSimplificationOptionsObjectFromList(addOptions: SimplificationOption[], existingOptions: Partial<SimplificationOptions> = {}, removeOptions: SimplificationOption[] = []): SimplificationOptionsObject {
	const options = mergeDefaults(existingOptions, defaultSimplificationOptionsObject)
	addOptions.forEach(option => { options[option] = true })
	removeOptions.forEach(option => { options[option] = false })
	return options
}

// Legacy Simplification Presets: Set up a SimplificationOptions object from a set of options.
export function getSimplificationOptionsObjectFromSet(addOptions: ReadonlySet<SimplificationOption>, existingOptions: Partial<SimplificationOptions> = {}, removeOptions: ReadonlySet<SimplificationOption> = new Set()): SimplificationOptionsObject {
	const options = mergeDefaults(existingOptions, defaultSimplificationOptionsObject)
	addOptions.forEach(option => { options[option] = true })
	removeOptions.forEach(option => { options[option] = false })
	return options
}
