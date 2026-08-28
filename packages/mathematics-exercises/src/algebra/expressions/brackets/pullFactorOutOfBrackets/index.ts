import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import twoTerms from './twoTerms.ts'
import threeTerms from './threeTerms.ts'

export default {
	examples: { twoTerms },
	exercises: { twoTerms, threeTerms },
} satisfies SkillExerciseBundle
