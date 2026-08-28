import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import basicForm from './basicForm.ts'
import squaresInNumerator from './squaresInNumerator.ts'

export default {
	examples: { basicForm },
	exercises: { basicForm, squaresInNumerator },
} satisfies SkillExerciseBundle
