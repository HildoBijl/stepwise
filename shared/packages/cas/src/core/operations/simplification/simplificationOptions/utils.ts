import { fromKeys, mergeDefaults, isReadonlyArray, isReadonlySet } from '@step-wise/utils'

import { allSimplificationOptions } from './allSimplificationOptions'
import type { SimplificationOption, SimplificationOptions, SimplificationOptionsInput, AddSimplificationOptions, RemoveSimplificationOptions, SimplificationPreset } from './types'

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

// Turn a SimplificationOptionsInput parameter into a set of simplification options.
export function getSimplificationOptionsFromInput(options: SimplificationOptionsInput): SimplificationOptions {
	if (isReadonlyArray(options)) return getSimplificationOptionsFromSet(new Set(options))
	if (isReadonlySet(options)) return getSimplificationOptionsFromSet(options)
	return mergeDefaults(options, defaultSimplificationOptions)
}

// Adjust existing simplification options. This can be done either through an adjustment object or through addition/removal sets/lists.
export function adjustSimplificationOptions(options: SimplificationOptionsInput, addOptions: AddSimplificationOptions = {}, removeOptions: RemoveSimplificationOptions = []): SimplificationOptions {
	const currentOptions = { ...getSimplificationOptionsFromInput(options) }

	// Set/array case
	if (isReadonlySet(addOptions) || isReadonlyArray(addOptions)) {
		const addOptionsSet = addOptions instanceof Set ? addOptions : new Set(addOptions)
		const removeOptionsSet = removeOptions instanceof Set ? removeOptions : new Set(removeOptions)
		addOptionsSet.forEach(option => { currentOptions[option] = true })
		removeOptionsSet.forEach(option => { currentOptions[option] = false })
		return currentOptions
	}

	// Object case
	return mergeDefaults(addOptions, currentOptions)
}

// Legacy Simplification Presets: adjust a SimplificationPreset given an adjustment.
export function adjustSimplificationPreset(preset: SimplificationPreset, adjustments: Partial<SimplificationOptions> = {}): SimplificationPreset {
	const adjust = (options: SimplificationOptions) => mergeDefaults(adjustments, options)
	return isReadonlyArray(preset) ? preset.map(adjust) : adjust(preset)
}
