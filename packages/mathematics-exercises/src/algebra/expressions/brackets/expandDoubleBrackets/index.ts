import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import basicForm from './basicForm.ts'
import multipleTerms from './multipleTerms.ts'
import higherPowers from './higherPowers.ts'
import squared from './squared.ts'

export default {
	examples: { basicForm },
	exercises: { multipleTerms, higherPowers, squared },
} satisfies SkillExerciseBundle
