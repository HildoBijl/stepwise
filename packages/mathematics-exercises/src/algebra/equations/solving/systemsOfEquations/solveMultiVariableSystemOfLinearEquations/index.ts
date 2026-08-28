import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import threeTerms from './threeTerms.ts'
import fourVariables from './fourVariables.ts'

export default {
	examples: { threeTerms },
	exercises: { threeTerms, fourVariables },
} satisfies SkillExerciseBundle
