import { isNumericInteger, ensureInteger, ensureNumericInteger, InterpretationError } from '@step-wise/js-utils'

import type { InputValue, InputValueAdapter } from '../types.ts'
import { createInputValue } from '../support.ts'

export const IntegerType = 'Integer'
export type IntegerType = typeof IntegerType
export type IntegerInputValue = InputValue<IntegerType, string>

function interpretInteger(inputValue: IntegerInputValue): number {
	const { value } = inputValue
	if (typeof value !== 'string') throw new InterpretationError(`Could not interpret a non-string value as an integer.`, 'InvalidInteger')
	if (value === '') throw new InterpretationError('Could not interpret an empty string into an integer.', 'Empty')
	if (value === '-') throw new InterpretationError('Could not interpret a number consisting only of a minus sign.', 'MinusSign')
	if (!isNumericInteger(value) || !Number.isSafeInteger(Number(value.trim()))) throw new InterpretationError(`Could not interpret "${value}" as a safe integer.`, 'InvalidInteger')
	return ensureNumericInteger(value, { safe: true })
}

function integerToInputValue(integer: number): IntegerInputValue {
	return createInputValue(IntegerType, ensureInteger(integer, { safe: true }).toString())
}

export const integerInputValueAdapter = {
	interpret: interpretInteger,
	toInputValue: integerToInputValue,
} satisfies InputValueAdapter<IntegerInputValue, number>
