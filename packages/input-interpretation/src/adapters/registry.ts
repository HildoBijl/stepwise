import type { AnyInputValueAdapter, InputValueAdapters } from '../types.ts'

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

export function getInputValueAdapter(type: string, customInputValueAdapters?: InputValueAdapters): AnyInputValueAdapter | undefined {
	if (customInputValueAdapters !== undefined && Object.hasOwn(customInputValueAdapters, type)) return customInputValueAdapters[type]
	return Object.hasOwn(inputValueAdapters, type) ? inputValueAdapters[type as keyof typeof inputValueAdapters] : undefined
}
