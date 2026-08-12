import { ensureInteger, integerRange, randomSubset, shuffle } from '@step-wise/utils'

export type MultipleChoiceMappingOptionsInput = {
	numChoices: number // How many choices are there?
	pick?: number // How many should we pick?
	include?: number | number[] // Are there any particular ones (like the correct options) we always must include?
	randomOrder?: boolean // Should we put the options in random order?
}

export type MultipleChoiceMappingOptions = {
	numChoices: number
	pick: number
	include: number[]
	randomOrder: boolean
}

export function getMultipleChoiceMapping(options: MultipleChoiceMappingOptionsInput): number[] {
	const { numChoices, pick, include, randomOrder } = resolveMultipleChoiceMappingOptions(options)
	const nonIncluded = integerRange(0, numChoices - 1).filter(index => !include.includes(index))
	const numExtra = Math.max(pick - include.length, 0)
	const mapping = [...include, ...randomSubset(nonIncluded, numExtra)] // Take the options to definitely include, and randomly add extras until the desired number.
	return randomOrder ? shuffle(mapping) : mapping.sort((a, b) => a - b)
}

export function resolveMultipleChoiceMappingOptions(options: MultipleChoiceMappingOptionsInput): MultipleChoiceMappingOptions {
	const numChoices = ensureInteger(options.numChoices, true, true)
	const pick = ensureInteger(options.pick ?? numChoices, true, true)
	const include = normalizeIncludedChoices(options.include, numChoices)
	const randomOrder = options.randomOrder ?? false
	if (pick > numChoices) throw new Error(`Invalid multiple choice mapping options: cannot pick ${pick} choices from only ${numChoices} choices.`)
	if (include.length > pick) throw new Error(`Invalid multiple choice mapping options: ${include.length} choices are included, but only ${pick} choices are requested.`)
	return { numChoices, pick, include, randomOrder }
}

function normalizeIncludedChoices(include: number | number[] | undefined, numChoices: number): number[] {
	if (include === undefined) return []
	return (Array.isArray(include) ? include : [include]).map(index => ensureChoiceIndex(index, numChoices))
}

function ensureChoiceIndex(index: number, numChoices: number): number {
	index = ensureInteger(index, true)
	if (index >= numChoices) throw new Error(`Invalid multiple choice include index: expected an index below ${numChoices}, but received ${index}.`)
	return index
}
