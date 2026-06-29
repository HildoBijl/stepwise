import { isInteger, ensureInteger, InterpretationError } from '@step-wise/utils'

import type { InputValue, InterpreterEntry } from '../types'
import { makeInputValue } from '../support'

const IntegerType = 'Integer'
export type IntegerType = typeof IntegerType
export type IntegerInputValue = InputValue<IntegerType, string>

function interpretInteger(inputValue: IntegerInputValue): number {
	const { value } = inputValue
	if (value === '') throw new InterpretationError('Could not interpret an empty string into an integer.', 'Empty')
	if (value === '-') throw new InterpretationError('Could not interpret a number consisting only of a minus sign.', 'MinusSign')
	const integer = Number(value)
	if (!isInteger(integer)) throw new InterpretationError(`Could not interpret "${value}" as an integer.`, 'InvalidInteger')
	return ensureInteger(integer)
}

function integerToInputValue(integer: number): IntegerInputValue {
	return makeInputValue(IntegerType, ensureInteger(integer).toString())
}

export const Integer = {
	interpret: interpretInteger,
	toInputValue: integerToInputValue,
} satisfies InterpreterEntry<IntegerInputValue, number>
