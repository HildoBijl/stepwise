import { ensureInteger, hasDuplicates, isInteger, InterpretationError } from '@step-wise/js-utils'

import type { InputValue, InputValueAdapter } from '../types.ts'
import { createInputValue, isInputValueOfType } from '../support.ts'

export const MultipleChoiceType = 'MultipleChoice'
export type MultipleChoiceType = typeof MultipleChoiceType

export type MultipleChoiceSelection = number | number[]
export type MultipleChoiceInputValue = InputValue<MultipleChoiceType, MultipleChoiceSelection>

function interpretMultipleChoice(inputValue: MultipleChoiceInputValue): MultipleChoiceSelection {
	const { value } = inputValue
	if (!Array.isArray(value)) return validateOption(value)
	return validateOptions(value)
}

function multipleChoiceToInputValue(value: MultipleChoiceSelection): MultipleChoiceInputValue {
	if (!Array.isArray(value)) return createInputValue(MultipleChoiceType, validateOption(value))
	return createInputValue(MultipleChoiceType, validateOptions(value))
}

function isMultipleChoiceSelection(value: unknown): value is MultipleChoiceSelection {
	return typeof value === 'number' || Array.isArray(value) && value.every(item => typeof item === 'number')
}

function validateOptions(values: unknown[]): number[] {
	const options = values.map(validateOption)
	if (hasDuplicates(options)) throw new InterpretationError(`Invalid multiple choice selection: duplicate options are not allowed.`, 'DuplicateOptions')
	return options
}

function validateOption(value: unknown): number {
	if (!isInteger(value) || !Number.isSafeInteger(value) || value < 0) throw new InterpretationError(`Invalid multiple choice option: expected a non-negative safe integer but received "${value}".`, 'InvalidOption')
	return ensureInteger(value, { nonNegative: true, safe: true })
}

export const multipleChoiceInputValueAdapter = {
	isInputValue: (value: unknown): value is MultipleChoiceInputValue => isInputValueOfType(value, MultipleChoiceType, isMultipleChoiceSelection),
	isDomainValue: isMultipleChoiceSelection,
	interpret: interpretMultipleChoice,
	toInputValue: multipleChoiceToInputValue,
} satisfies InputValueAdapter<MultipleChoiceInputValue, MultipleChoiceSelection>
