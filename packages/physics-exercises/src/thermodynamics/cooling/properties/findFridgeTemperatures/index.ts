import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import findFridgeTemperaturesInternal from './findFridgeTemperaturesInternal.ts'
import findFridgeTemperaturesExternal from './findFridgeTemperaturesExternal.ts'

export default {
	examples: { findFridgeTemperaturesInternal },
	exercises: { findFridgeTemperaturesInternal, findFridgeTemperaturesExternal },
} satisfies SkillExerciseBundle
