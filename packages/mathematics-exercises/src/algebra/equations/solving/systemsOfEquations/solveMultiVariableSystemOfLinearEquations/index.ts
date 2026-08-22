import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import threeTerms from './threeTerms'
import fourVariables from './fourVariables'

export default {
	examples: { threeTerms },
	exercises: { threeTerms, fourVariables },
} satisfies SkillExerciseBundle
