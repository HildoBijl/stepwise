import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import processNameToProperty from './processNameToProperty.ts'
import propertyToProcessName from './propertyToProcessName.ts'
import findProcessCoefficient from './findProcessCoefficient.ts'

export default {
	examples: { processNameToProperty },
	exercises: { processNameToProperty, propertyToProcessName, findProcessCoefficient },
} satisfies SkillExerciseBundle
