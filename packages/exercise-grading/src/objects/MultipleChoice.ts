import { type MultipleChoiceValue } from '@step-wise/input-interpretation'
import { ensureInteger, hasDuplicates } from '@step-wise/js-utils'

export function compareMultipleChoice(inputValue: MultipleChoiceValue, expectedValue: MultipleChoiceValue): boolean {
	const inputList = ensureMultipleChoiceValue(inputValue)
	const expectedList = ensureMultipleChoiceValue(expectedValue)
	return inputList.length === expectedList.length && inputList.every(item => expectedList.includes(item))
}

function ensureMultipleChoiceValue(value: unknown): number[] {
	const values = (Array.isArray(value) ? value : [value]).map(option => ensureInteger(option, { nonNegative: true }))
	if (hasDuplicates(values)) throw new Error(`Invalid multiple choice comparison: duplicate options are not allowed.`)
	return values
}
