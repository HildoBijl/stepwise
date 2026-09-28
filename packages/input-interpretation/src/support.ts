import { type PlainDataValue, hasOnlyKeys, isPlainDataValue, isPlainObject } from '@step-wise/js-utils'

import type { InputValue, InputValueMap } from './types.ts'

// Wraps the given type and value into an InputValue object.
export function createInputValue<TType extends string, TValue extends PlainDataValue>(type: TType, value: TValue): InputValue<TType, TValue> {
	return { type, value }
}

// Check whether a value is a generic input-value envelope.
export function isInputValue(value: unknown): value is InputValue {
	return isPlainObject(value) && hasOnlyKeys(value, ['type', 'value']) && typeof value.type === 'string' && isPlainDataValue(value.value)
}

// Check whether a value is an input-field map containing input values.
export function isInputValueMap(value: unknown): value is InputValueMap {
	return isPlainObject(value) && Object.values(value).every(isInputValue)
}

// Checks the exact { type, value } envelope. Richer input values need a dedicated guard.
export function isInputValueOfType<TType extends string, TValue extends PlainDataValue>(value: unknown, type: TType, isValue: (value: unknown) => value is TValue): value is InputValue<TType, TValue> {
	return isPlainObject(value) && Object.keys(value).length === 2 && value.type === type && isValue(value.value)
}
