import { type SkillExercises } from '@step-wise/exercise-definition'

import calculateEntropyChangeIsotherm from './calculateEntropyChangeIsotherm'
import calculateEntropyChangeWithTemperature from './calculateEntropyChangeWithTemperature'
import calculateEntropyChangeWithProperties from './calculateEntropyChangeWithProperties'

export default {
	examples: { calculateEntropyChangeIsotherm },
	exercises: { calculateEntropyChangeIsotherm, calculateEntropyChangeWithTemperature, calculateEntropyChangeWithProperties },
} satisfies SkillExercises
