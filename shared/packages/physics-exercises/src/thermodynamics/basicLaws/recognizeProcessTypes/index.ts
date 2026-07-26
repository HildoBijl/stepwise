import { type SkillExercises } from '@step-wise/exercise-definition'

import processNameToProperty from './processNameToProperty'
import propertyToProcessName from './propertyToProcessName'
import findProcessCoefficient from './findProcessCoefficient'

export default {
	examples: { processNameToProperty },
	exercises: { processNameToProperty, propertyToProcessName, findProcessCoefficient },
} satisfies SkillExercises
