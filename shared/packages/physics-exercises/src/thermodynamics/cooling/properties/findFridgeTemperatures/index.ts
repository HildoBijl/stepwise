import { type SkillExercises } from '@step-wise/exercise-bundling'

import findFridgeTemperaturesInternal from './findFridgeTemperaturesInternal'
import findFridgeTemperaturesExternal from './findFridgeTemperaturesExternal'

export default {
	examples: { findFridgeTemperaturesInternal },
	exercises: { findFridgeTemperaturesInternal, findFridgeTemperaturesExternal },
} satisfies SkillExercises
