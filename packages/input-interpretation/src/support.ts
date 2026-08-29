import { type PlainDataValue, isPlainObject } from '@step-wise/js-utils'

import type { InputValue } from './types.ts'

export function createInputValue<TType extends string, TValue extends PlainDataValue>(type: TType, value: TValue): InputValue<TType, TValue> {
	return { type, value }
}

// Checks the exact { type, value } envelope. Richer input values need a dedicated guard.
export function isInputValueOfType<TType extends string, TValue extends PlainDataValue>(value: unknown, type: TType, isValue: (value: unknown) => value is TValue): value is InputValue<TType, TValue> {
	return isPlainObject(value) && Object.keys(value).length === 2 && value.type === type && isValue(value.value)
}
