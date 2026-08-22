import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import twoTerms from './twoTerms'
import threeTerms from './threeTerms'

export default {
	examples: { twoTerms },
	exercises: { twoTerms, threeTerms },
} satisfies SkillExerciseBundle
