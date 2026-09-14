import { hasOnlyKeys, isPlainObject } from '@step-wise/js-utils'
import { isSerializationAdapter } from '@step-wise/serialization'
import { isInputValueAdapter } from '@step-wise/input-interpretation'
import { isValueEqualityAdapter } from '@step-wise/value-equality'

import type { ValueType, ValueTypes } from './types.ts'

export function isValueType(value: unknown): value is ValueType {
	return isPlainObject(value) && hasOnlyKeys(value, ['inputValue', 'serialization', 'equality'])
		&& (value.serialization === undefined || isSerializationAdapter(value.serialization))
		&& (value.inputValue === undefined || isInputValueAdapter(value.inputValue))
		&& (value.equality === undefined || isValueEqualityAdapter(value.equality))
}

export function isValueTypes(value: unknown): value is ValueTypes {
	return isPlainObject(value) && Object.values(value).every(isValueType)
}
