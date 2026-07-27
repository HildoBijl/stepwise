import { type SkillExercises } from '@step-wise/exercise-definition'

import basicForm from './basicForm'
import higherPowers from './higherPowers'
import multipleFactors from './multipleFactors'

export default {
	examples: { basicForm },
	exercises: { higherPowers, multipleFactors },
} satisfies SkillExercises
