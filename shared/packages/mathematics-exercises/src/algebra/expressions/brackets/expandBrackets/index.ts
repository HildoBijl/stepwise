import { type SkillExercises } from '@step-wise/exercise-definition'

import basicForm from './basicForm'
import factorBehind from './factorBehind'
import negativeFactor from './negativeFactor'
import multipleTerms from './multipleTerms'

export default {
	examples: { basicForm },
	exercises: { factorBehind, negativeFactor, multipleTerms },
} satisfies SkillExercises
