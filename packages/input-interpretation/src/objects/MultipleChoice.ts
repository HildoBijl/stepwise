import { ensureInteger, hasDuplicates, isInteger, InterpretationError } from '@step-wise/js-utils'

import type { InputValue, InterpreterEntry } from '../types'
import { makeInputValue } from '../support'

export const MultipleChoiceType = 'MultipleChoice'
export type MultipleChoiceType = typeof MultipleChoiceType

export type MultipleChoiceValue = number | number[]
export type MultipleChoiceInputValue = InputValue<MultipleChoiceType, MultipleChoiceValue>

function interpretMultipleChoice(inputValue: MultipleChoiceInputValue): MultipleChoiceValue {
	const { value } = inputValue
	if (!Array.isArray(value)) return validateOption(value)
	return validateOptions(value)
}

function multipleChoiceToInputValue(value: MultipleChoiceValue): MultipleChoiceInputValue {
	if (!Array.isArray(value)) return makeInputValue(MultipleChoiceType, validateOption(value))
	return makeInputValue(MultipleChoiceType, validateOptions(value))
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

export const MultipleChoiceInterpreter = {
	interpret: interpretMultipleChoice,
	toInputValue: multipleChoiceToInputValue,
} satisfies InterpreterEntry<MultipleChoiceInputValue, MultipleChoiceValue>
