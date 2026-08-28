import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import multipleBasicFractions from './multipleBasicFractions.ts'
import extraFractionInNumerator from './extraFractionInNumerator.ts'
import extraFractionInDenominator from './extraFractionInDenominator.ts'

export default {
	examples: { multipleBasicFractions },
	exercises: { multipleBasicFractions, extraFractionInNumerator, extraFractionInDenominator },
} satisfies SkillExerciseBundle
