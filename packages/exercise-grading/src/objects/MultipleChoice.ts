import { type MultipleChoiceValue } from '@step-wise/input-interpretation'
import { ensureInteger, hasDuplicates } from '@step-wise/js-utils'

export function compareMultipleChoice(input: MultipleChoiceValue, correct: MultipleChoiceValue): boolean {
	const inputList = ensureMultipleChoiceValue(input)
	const correctList = ensureMultipleChoiceValue(correct)
	return inputList.length === correctList.length && inputList.every(item => correctList.includes(item))
}

function ensureMultipleChoiceValue(value: unknown): number[] {
	const values = (Array.isArray(value) ? value : [value]).map(option => ensureInteger(option, { nonNegative: true }))
	if (hasDuplicates(values)) throw new Error(`Invalid multiple choice comparison: duplicate options are not allowed.`)
	return values
}
