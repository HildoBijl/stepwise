import { IntegerType, integerInputValueAdapter } from './integer'
import { MultipleChoiceType, multipleChoiceInputValueAdapter } from './multipleChoice'
import { physicsInputValueAdapters } from './physics'
import { casInputValueAdapters } from './cas'
import { geometryInputValueAdapters } from './geometry'
import { mechanicsInputValueAdapters } from './mechanics'

export const inputValueAdapters = {
	[IntegerType]: integerInputValueAdapter,
	[MultipleChoiceType]: multipleChoiceInputValueAdapter,
	...physicsInputValueAdapters,
	...casInputValueAdapters,
	...geometryInputValueAdapters,
	...mechanicsInputValueAdapters,
}
