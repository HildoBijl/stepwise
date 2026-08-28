import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import basicForm from './basicForm.ts'
import higherPowers from './higherPowers.ts'
import multipleFactors from './multipleFactors.ts'

export default {
	examples: { basicForm },
	exercises: { higherPowers, multipleFactors },
} satisfies SkillExerciseBundle
