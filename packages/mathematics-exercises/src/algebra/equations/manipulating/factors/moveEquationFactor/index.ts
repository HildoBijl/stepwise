import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import basicDivision from './basicDivision.ts'
import basicMultiplication from './basicMultiplication.ts'
import division from './division.ts'
import multiplication from './multiplication.ts'

export default {
	examples: { basicDivision, basicMultiplication },
	exercises: { division, multiplication },
} satisfies SkillExerciseBundle
