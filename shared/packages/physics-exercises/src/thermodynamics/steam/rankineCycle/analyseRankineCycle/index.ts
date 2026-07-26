import { type SkillExercises } from '@step-wise/exercise-definition'

import analyseRankineCycleWithEtai from './analyseRankineCycleWithEtai'
import analyseRankineCycleWithX3 from './analyseRankineCycleWithX3'

export default {
	examples: { analyseRankineCycleWithEtai },
	exercises: { analyseRankineCycleWithEtai, analyseRankineCycleWithX3 },
} satisfies SkillExercises
