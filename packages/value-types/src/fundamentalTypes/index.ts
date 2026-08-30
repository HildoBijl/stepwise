import type { ValueTypes } from '../definitions/index.ts'

import { IntegerType, integerValueType } from './integer/index.ts'
import { MultipleChoiceType, multipleChoiceValueType } from './multipleChoice/index.ts'

export * from './integer/index.ts'
export * from './multipleChoice/index.ts'

export const fundamentalValueTypes = {
	[IntegerType]: integerValueType,
	[MultipleChoiceType]: multipleChoiceValueType,
} satisfies ValueTypes
