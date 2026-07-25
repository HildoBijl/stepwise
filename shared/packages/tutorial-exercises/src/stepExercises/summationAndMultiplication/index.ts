import { type SkillExercises } from '@step-wise/exercise-definition'

import summationAndMultiplication1 from './summationAndMultiplication1'
import summationAndMultiplication2 from './summationAndMultiplication2'

export default {
	examples: { summationAndMultiplication1 },
	exercises: { summationAndMultiplication1, summationAndMultiplication2 },
} satisfies SkillExercises
