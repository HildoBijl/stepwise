import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import basicForm from './basicForm.ts'
import factorBehind from './factorBehind.ts'
import negativeFactor from './negativeFactor.ts'
import multipleTerms from './multipleTerms.ts'

export default {
	examples: { basicForm },
	exercises: { factorBehind, negativeFactor, multipleTerms },
} satisfies SkillExerciseBundle
