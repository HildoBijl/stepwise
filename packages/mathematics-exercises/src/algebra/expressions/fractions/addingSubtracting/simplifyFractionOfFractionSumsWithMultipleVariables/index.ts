import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import sumInDenominator from './sumInDenominator.ts'
import sumInNumerator from './sumInNumerator.ts'
import sumsWithIntegers from './sumsWithIntegers.ts'
import sumsWithFractions from './sumsWithFractions.ts'

export default {
	examples: { sumInDenominator, sumInNumerator },
	exercises: { sumInDenominator, sumInNumerator, sumsWithIntegers, sumsWithFractions },
} satisfies SkillExerciseBundle
