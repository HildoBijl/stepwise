import { type SkillExercises } from '@step-wise/exercise-bundling'

import basicDivision from './basicDivision'
import basicMultiplication from './basicMultiplication'
import division from './division'
import multiplication from './multiplication'

export default {
	examples: { basicDivision, basicMultiplication },
	exercises: { division, multiplication },
} satisfies SkillExercises
