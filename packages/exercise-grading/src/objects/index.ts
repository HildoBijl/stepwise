import { IntegerType, MultipleChoiceType } from '@step-wise/input-interpretation'

import { compareInteger } from './Integer.ts'
import { compareMultipleChoice } from './MultipleChoice.ts'
import { physicsCompareFunctions } from './physics.ts'
import { casCompareFunctions } from './cas.ts'
import { geometryCompareFunctions } from './geometry.ts'
import { mechanicsCompareFunctions } from './mechanics.ts'

export * from './Integer.ts'
export * from './MultipleChoice.ts'
export * from './physics.ts'
export * from './cas.ts'
export * from './geometry.ts'
export * from './mechanics.ts'

export const compareFunctions = {
	[IntegerType]: compareInteger,
	[MultipleChoiceType]: compareMultipleChoice,
	...physicsCompareFunctions,
	...casCompareFunctions,
	...geometryCompareFunctions,
	...mechanicsCompareFunctions,
}
