import type { PlainDataValue } from '@step-wise/js-utils'

import type { InputValue } from './types'

export function makeInputValue<Type extends string, Value extends PlainDataValue>(type: Type, value: Value): InputValue<Type, Value> {
	return { type, value }
}
