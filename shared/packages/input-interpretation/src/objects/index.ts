import { IntegerType, IntegerInterpreter } from './Integer'
import { MultipleChoiceType, MultipleChoiceInterpreter } from './MultipleChoice'
import { physicsInterpreters } from './physics'
import { casInterpreters } from './cas'
import { geometryInterpreters } from './geometry'

export * from './Integer'
export * from './MultipleChoice'
export * from './physics'
export * from './cas'
export * from './geometry'

export const interpreters = {
	[IntegerType]: IntegerInterpreter,
	[MultipleChoiceType]: MultipleChoiceInterpreter,
	...physicsInterpreters,
	...casInterpreters,
	...geometryInterpreters
}
