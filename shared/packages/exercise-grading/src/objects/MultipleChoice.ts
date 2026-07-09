import { type MultipleChoiceValue } from '@step-wise/input-interpretation'

export function compareMultipleChoice(input: MultipleChoiceValue, correct: MultipleChoiceValue): boolean {
	if (!isMultipleChoiceValue(input) || !isMultipleChoiceValue(correct))	throw new Error(`Invalid multiple choice comparison: received parameters that were not numbers or number arrays.`)
	const inputList = normalizeMultipleChoiceValue(input)
	const correctList = normalizeMultipleChoiceValue(correct)
	return inputList.length === correctList.length && inputList.every(item => correctList.includes(item))
}

function isMultipleChoiceValue(value: unknown): value is MultipleChoiceValue {
	return typeof value === 'number' || (Array.isArray(value) && value.every(item => typeof item === 'number'))
}

function normalizeMultipleChoiceValue(value: MultipleChoiceValue): number[] {
	return typeof value === 'number' ? [value] : value
}
