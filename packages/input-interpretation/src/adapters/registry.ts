import type { InputValueAdapters } from '../types.ts'

import { IntegerType, integerInputValueAdapter } from './integer.ts'
import { MultipleChoiceType, multipleChoiceInputValueAdapter } from './multipleChoice.ts'
import { physicsInputValueAdapters } from './physics.ts'
import { casInputValueAdapters } from './cas.ts'
import { geometryInputValueAdapters } from './geometry.ts'
import { mechanicsInputValueAdapters } from './mechanics.ts'

export const inputValueAdapters = {
	[IntegerType]: integerInputValueAdapter,
	[MultipleChoiceType]: multipleChoiceInputValueAdapter,
	...physicsInputValueAdapters,
	...casInputValueAdapters,
	...geometryInputValueAdapters,
	...mechanicsInputValueAdapters,
} satisfies InputValueAdapters
