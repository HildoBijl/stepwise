import { IntegerType, MultipleChoiceType } from '@step-wise/input-interpretation'

import { compareInteger } from './Integer'
import { compareMultipleChoice } from './MultipleChoice'
import { physicsCompareFunctions } from './physics'
import { casCompareFunctions } from './cas'
import { geometryCompareFunctions } from './geometry'
import { mechanicsCompareFunctions } from './mechanics'

export * from './Integer'
export * from './MultipleChoice'
export * from './physics'
export * from './cas'
export * from './geometry'
export * from './mechanics'

export const compareFunctions = {
	[IntegerType]: compareInteger,
	[MultipleChoiceType]: compareMultipleChoice,
	...physicsCompareFunctions,
	...casCompareFunctions,
	...geometryCompareFunctions,
	...mechanicsCompareFunctions,
}
