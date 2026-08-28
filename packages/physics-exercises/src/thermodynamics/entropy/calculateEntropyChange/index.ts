import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateEntropyChangeIsotherm from './calculateEntropyChangeIsotherm.ts'
import calculateEntropyChangeWithTemperature from './calculateEntropyChangeWithTemperature.ts'
import calculateEntropyChangeWithProperties from './calculateEntropyChangeWithProperties.ts'

export default {
	examples: { calculateEntropyChangeIsotherm },
	exercises: { calculateEntropyChangeIsotherm, calculateEntropyChangeWithTemperature, calculateEntropyChangeWithProperties },
} satisfies SkillExerciseBundle
