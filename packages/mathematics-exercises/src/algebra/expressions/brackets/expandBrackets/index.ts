import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import basicForm from './basicForm'
import factorBehind from './factorBehind'
import negativeFactor from './negativeFactor'
import multipleTerms from './multipleTerms'

export default {
	examples: { basicForm },
	exercises: { factorBehind, negativeFactor, multipleTerms },
} satisfies SkillExerciseBundle
