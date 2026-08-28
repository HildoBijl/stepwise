import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateWithSpecificQuantitiesDensity from './calculateWithSpecificQuantitiesDensity.ts'
import calculateWithSpecificQuantitiesBoiler from './calculateWithSpecificQuantitiesBoiler.ts'
import calculateWithSpecificQuantitiesTurbine from './calculateWithSpecificQuantitiesTurbine.ts'

export default {
	examples: { calculateWithSpecificQuantitiesDensity },
	exercises: { calculateWithSpecificQuantitiesDensity, calculateWithSpecificQuantitiesBoiler, calculateWithSpecificQuantitiesTurbine },
} satisfies SkillExerciseBundle
