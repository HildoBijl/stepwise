import { type SkillExercises } from '@step-wise/exercise-definition'

import multipleBasicFractions from './multipleBasicFractions'
import extraFractionInNumerator from './extraFractionInNumerator'
import extraFractionInDenominator from './extraFractionInDenominator'

export default {
	examples: { multipleBasicFractions },
	exercises: { multipleBasicFractions, extraFractionInNumerator, extraFractionInDenominator },
} satisfies SkillExercises
