import { type SkillExercises } from '@step-wise/exercise-definition'

import basicForm from './basicForm'
import squaresInNumerator from './squaresInNumerator'

export default {
	examples: { basicForm },
	exercises: { basicForm, squaresInNumerator },
} satisfies SkillExercises
