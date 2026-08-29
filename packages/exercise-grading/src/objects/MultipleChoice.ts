import { ensureInteger, hasDuplicates, isInteger } from '@step-wise/js-utils'
import type { ValueEqualityAdapter } from '@step-wise/value-equality'
import { type MultipleChoiceSelection } from '@step-wise/input-interpretation'

export function areMultipleChoiceSelectionsEqual(inputValue: MultipleChoiceSelection, expectedValue: MultipleChoiceSelection): boolean {
	const inputList = ensureMultipleChoiceSelection(inputValue)
	const expectedList = ensureMultipleChoiceSelection(expectedValue)
	return inputList.length === expectedList.length && inputList.every(item => expectedList.includes(item))
}

function isMultipleChoiceSelection(value: unknown): value is MultipleChoiceSelection {
	const values = Array.isArray(value) ? value : [value]
	return values.every(option => isInteger(option) && option >= 0) && !hasDuplicates(values)
}

function ensureMultipleChoiceSelection(value: unknown): number[] {
	const values = (Array.isArray(value) ? value : [value]).map(option => ensureInteger(option, { nonNegative: true }))
	if (hasDuplicates(values)) throw new Error(`Invalid multiple choice comparison: duplicate options are not allowed.`)
	return values
}

export const multipleChoiceEquality: ValueEqualityAdapter<MultipleChoiceSelection> = {
	isValue: isMultipleChoiceSelection,
	areEqual: areMultipleChoiceSelectionsEqual,
}
