import { IntegerType, MultipleChoiceType } from '@step-wise/input-interpretation'
import type { ValueEqualityAdapters } from '@step-wise/value-equality'

import { integerEquality } from './Integer.ts'
import { multipleChoiceEquality } from './MultipleChoice.ts'

export * from './Integer.ts'
export * from './MultipleChoice.ts'

export const equalityAdapters: ValueEqualityAdapters = {
	[IntegerType]: integerEquality,
	[MultipleChoiceType]: multipleChoiceEquality,
}