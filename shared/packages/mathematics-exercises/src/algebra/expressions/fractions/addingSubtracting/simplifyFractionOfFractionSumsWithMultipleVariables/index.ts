import { type SkillExercises } from '@step-wise/exercise-bundling'

import sumInDenominator from './sumInDenominator'
import sumInNumerator from './sumInNumerator'
import sumsWithIntegers from './sumsWithIntegers'
import sumsWithFractions from './sumsWithFractions'

export default {
	examples: { sumInDenominator, sumInNumerator },
	exercises: { sumInDenominator, sumInNumerator, sumsWithIntegers, sumsWithFractions },
} satisfies SkillExercises
