import { IntegerType, MultipleChoiceType } from '@step-wise/input-interpretation'
import type { ValueEqualityAdapters } from '@step-wise/value-equality'

import { integerEquality } from './Integer.ts'
import { multipleChoiceEquality } from './MultipleChoice.ts'
import { physicsEqualityAdapters } from './physics.ts'
import { casEqualityAdapters } from './cas.ts'
import { geometryEqualityAdapters } from './geometry.ts'
import { mechanicsEqualityAdapters } from './mechanics.ts'

export * from './Integer.ts'
export * from './MultipleChoice.ts'
export * from './physics.ts'
export * from './cas.ts'
export * from './geometry.ts'
export * from './mechanics.ts'

export const equalityAdapters: ValueEqualityAdapters = {
	[IntegerType]: integerEquality,
	[MultipleChoiceType]: multipleChoiceEquality,
	...physicsEqualityAdapters,
	...casEqualityAdapters,
	...geometryEqualityAdapters,
	...mechanicsEqualityAdapters,
}
