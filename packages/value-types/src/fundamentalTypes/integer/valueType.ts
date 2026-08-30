import type { ValueType } from '../../definitions/index.ts'

import { integerEqualityAdapter } from './equality.ts'
import { integerInputValueAdapter } from './inputValue.ts'

export const integerValueType = {
	inputValue: integerInputValueAdapter,
	equality: integerEqualityAdapter,
} satisfies ValueType
