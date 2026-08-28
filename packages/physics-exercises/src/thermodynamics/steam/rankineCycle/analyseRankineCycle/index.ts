import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import analyseRankineCycleWithEtai from './analyseRankineCycleWithEtai.ts'
import analyseRankineCycleWithX3 from './analyseRankineCycleWithX3.ts'

export default {
	examples: { analyseRankineCycleWithEtai },
	exercises: { analyseRankineCycleWithEtai, analyseRankineCycleWithX3 },
} satisfies SkillExerciseBundle
