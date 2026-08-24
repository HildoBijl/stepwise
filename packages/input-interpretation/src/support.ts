import type { PlainDataValue } from '@step-wise/js-utils'

import type { InputValue } from './types'

export function createInputValue<TType extends string, TValue extends PlainDataValue>(type: TType, value: TValue): InputValue<TType, TValue> {
	return { type, value }
}
