import { type SkillExercises } from '@step-wise/exercise-bundling'

import basicForm from './basicForm'
import squaresInNumerator from './squaresInNumerator'

export default {
	examples: { basicForm },
	exercises: { basicForm, squaresInNumerator },
} satisfies SkillExercises
