import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import multipleBasicFractions from './multipleBasicFractions'
import extraFractionInNumerator from './extraFractionInNumerator'
import extraFractionInDenominator from './extraFractionInDenominator'

export default {
	examples: { multipleBasicFractions },
	exercises: { multipleBasicFractions, extraFractionInNumerator, extraFractionInDenominator },
} satisfies SkillExerciseBundle
