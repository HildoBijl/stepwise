import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import findBasicDerivativeTwoTerms from './findBasicDerivativeTwoTerms.ts'
import findBasicDerivativeThreeTerms from './findBasicDerivativeThreeTerms.ts'

export default {
	examples: {},
	exercises: { findBasicDerivativeTwoTerms, findBasicDerivativeThreeTerms },
} satisfies SkillExerciseBundle
