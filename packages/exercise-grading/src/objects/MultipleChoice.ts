import { ensureInteger, hasDuplicates } from '@step-wise/js-utils'
import { type MultipleChoiceSelection } from '@step-wise/input-interpretation'

export function compareMultipleChoice(inputValue: MultipleChoiceSelection, expectedValue: MultipleChoiceSelection): boolean {
	const inputList = ensureMultipleChoiceSelection(inputValue)
	const expectedList = ensureMultipleChoiceSelection(expectedValue)
	return inputList.length === expectedList.length && inputList.every(item => expectedList.includes(item))
}

function ensureMultipleChoiceSelection(value: unknown): number[] {
	const values = (Array.isArray(value) ? value : [value]).map(option => ensureInteger(option, { nonNegative: true }))
	if (hasDuplicates(values)) throw new Error(`Invalid multiple choice comparison: duplicate options are not allowed.`)
	return values
}
