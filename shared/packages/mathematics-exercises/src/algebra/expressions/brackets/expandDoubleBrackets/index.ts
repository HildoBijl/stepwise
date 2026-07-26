import { type SkillExercises } from '@step-wise/exercise-definition'

import basicForm from './basicForm'
import multipleTerms from './multipleTerms'
import higherPowers from './higherPowers'
import squared from './squared'

export default {
	examples: { basicForm },
	exercises: { multipleTerms, higherPowers, squared },
} satisfies SkillExercises
