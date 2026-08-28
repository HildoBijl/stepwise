import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import moveSingleTerm from './moveSingleTerm.ts'
import moveAllTerms from './moveAllTerms.ts'

export default {
	examples: { moveSingleTerm },
	exercises: { moveSingleTerm, moveAllTerms },
} satisfies SkillExerciseBundle
