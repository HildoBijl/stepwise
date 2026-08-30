import type { ValueType } from '../../definitions/index.ts'

import { multipleChoiceEqualityAdapter } from './equality.ts'
import { multipleChoiceInputValueAdapter } from './inputValue.ts'

export const multipleChoiceValueType = {
	inputValue: multipleChoiceInputValueAdapter,
	equality: multipleChoiceEqualityAdapter,
} satisfies ValueType
