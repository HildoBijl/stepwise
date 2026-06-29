import { isInteger, ensureInteger, InterpretationError } from '@step-wise/utils'

import type { InputValue, InterpreterEntry } from '../types'
import { makeInputValue } from '../support'

const MultipleChoiceType = 'MultipleChoice'
export type MultipleChoiceType = typeof MultipleChoiceType

type MultipleChoiceValue = number | number[]
export type MultipleChoiceInputValue = InputValue<MultipleChoiceType, MultipleChoiceValue>

function interpretMultipleChoice(inputValue: MultipleChoiceInputValue): MultipleChoiceValue {
	const { value } = inputValue
	return Array.isArray(value) ? value.map(validateOption) : validateOption(value)
}

function multipleChoiceToInputValue(value: MultipleChoiceValue): MultipleChoiceInputValue {
	return Array.isArray(value) ? makeInputValue(MultipleChoiceType, value.map(validateOption)) : makeInputValue(MultipleChoiceType, validateOption(value))
}

function validateOption(value: number): number {
	if (!isInteger(value) || value < 0) throw new InterpretationError(`Invalid multiple choice option: expected a non-negative integer but received "${value}".`, 'InvalidOption')
	return ensureInteger(value, true)
}

export const MultipleChoice = {
	interpret: interpretMultipleChoice,
	toInputValue: multipleChoiceToInputValue,
} satisfies InterpreterEntry<MultipleChoiceInputValue, MultipleChoiceValue>
