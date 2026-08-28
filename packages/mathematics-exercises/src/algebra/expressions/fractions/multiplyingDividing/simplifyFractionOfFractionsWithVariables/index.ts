import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import basicForm from './basicForm.ts'
import higherPowers from './higherPowers.ts'
import multipleFactors from './multipleFactors.ts'
import multipleFactorsNegativePowers from './multipleFactorsNegativePowers.ts'

export default {
	examples: { basicForm },
	exercises: { higherPowers, multipleFactors, multipleFactorsNegativePowers },
} satisfies SkillExerciseBundle
