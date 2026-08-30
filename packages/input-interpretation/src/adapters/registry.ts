import type { AnyInputValueAdapter, InputValueAdapters } from '../types.ts'

import { IntegerType, integerInputValueAdapter } from './integer.ts'
import { MultipleChoiceType, multipleChoiceInputValueAdapter } from './multipleChoice.ts'

export const inputValueAdapters = {
	[IntegerType]: integerInputValueAdapter,
	[MultipleChoiceType]: multipleChoiceInputValueAdapter,
} satisfies InputValueAdapters

export function getInputValueAdapter(type: string, customInputValueAdapters?: InputValueAdapters): AnyInputValueAdapter | undefined {
	if (customInputValueAdapters !== undefined && Object.hasOwn(customInputValueAdapters, type)) {
		if (Object.hasOwn(inputValueAdapters, type)) throw new Error(`Duplicate input-value adapter for type "${type}".`)
		return customInputValueAdapters[type]
	}
	return Object.hasOwn(inputValueAdapters, type) ? inputValueAdapters[type as keyof typeof inputValueAdapters] : undefined
}
