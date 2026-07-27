import { type SkillExercises } from '@step-wise/exercise-definition'

import twoTerms from './twoTerms'
import threeTerms from './threeTerms'

export default {
	examples: { twoTerms },
	exercises: { twoTerms, threeTerms },
} satisfies SkillExercises
