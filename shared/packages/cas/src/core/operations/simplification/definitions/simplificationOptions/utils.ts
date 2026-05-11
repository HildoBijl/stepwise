import { mergeDefaults } from '@step-wise/utils'

import { type SimplificationOption, type SimplificationOptions } from './types'
import { noSimplify } from './noSimplify'

// Turn a SimplificationOptions object into a list of options that have been turned on.
export function getActiveSimplificationOptions(options: SimplificationOptions): SimplificationOption[] {
	return (Object.keys(options) as SimplificationOption[]).filter(key => options[key])
}

// Set up a SimplificationOptions object from a list of options.
export function getSimplificationOptionsFromList(optionList: SimplificationOption[], existingOptions: Partial<SimplificationOptions> = {}, removeOptionList: SimplificationOption[] = []) {
	const options = mergeDefaults(existingOptions, noSimplify)
	optionList.forEach(option => { options[option] = true })
	removeOptionList.forEach(option => { options[option] = false })
	return options
}
