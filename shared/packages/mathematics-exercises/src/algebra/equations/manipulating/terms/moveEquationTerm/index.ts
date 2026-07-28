import { type SkillExercises } from '@step-wise/exercise-bundling'

import moveSingleTerm from './moveSingleTerm'
import moveAllTerms from './moveAllTerms'

export default {
	examples: { moveSingleTerm },
	exercises: { moveSingleTerm, moveAllTerms },
} satisfies SkillExercises
