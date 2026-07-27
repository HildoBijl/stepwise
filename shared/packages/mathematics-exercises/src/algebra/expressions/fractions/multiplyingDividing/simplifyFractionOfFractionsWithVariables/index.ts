import { type SkillExercises } from '@step-wise/exercise-definition'

import basicForm from './basicForm'
import higherPowers from './higherPowers'
import multipleFactors from './multipleFactors'
import multipleFactorsNegativePowers from './multipleFactorsNegativePowers'

export default {
	examples: { basicForm },
	exercises: { higherPowers, multipleFactors, multipleFactorsNegativePowers },
} satisfies SkillExercises
